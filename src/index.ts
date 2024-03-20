import GUI from 'lil-gui';


async function main() {

  let params = {
    repulsion: 2.0,
    inertia: 0.1,
    dt: 0.1,
    n_agents: 64*10,
    K: 6,
    world_extent: 15.0,
    resetBuffers: () => { resetBuffers(); }
  } 


  const adapter = await navigator.gpu?.requestAdapter();
  let device = await adapter?.requestDevice();
  

  if (!device) {
    fail('need a browser that supports WebGPU');
    return;
  }
  else {
    console.log('WebGPU is supported');
  }

  // Use lost to handle lost devices
  device.lost.then((info) => {
    console.error(`WebGPU device was lost: ${info.message}`);
    device = null;

    if (info.reason !== "destroyed") {
      main();
    }
  });

  var canvas = document.querySelector('canvas')
  const compute_shader = await fetch('./shaders/plife_compute.wgsl').then((response) => response.text());


  // BUFFERS

  const paramsBuffer = device.createBuffer({
    label: 'params buffer',
    size: (Object.keys(params).length) * 4, // 4 bytes per float
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  });


  const FBuffer = device.createBuffer({
    label: 'F buffer',
    size: params.K * params.K * 4,
    usage:  GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  }); // attraction/repulsion matrix

  const colorsBuffer = device.createBuffer({
    label: 'colors buffer',
    size: params.n_agents * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  }); // agent color

  const velocitiesBuffer = device.createBuffer({
    label: 'velocities buffer',
    size: params.n_agents * 3 * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const positionsBuffer = device.createBuffer({
    label: 'positions buffer',
    size: params.n_agents * 3 * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
  });

  const positionsResultBuffer = device.createBuffer({
    label: 'Position buffer result',
    size: params.n_agents * 3 * 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });


  // INITIALIZE BUFFERS

  let resetBuffers = () => {
    const positions = new Float32Array(params['point_n'] * 3);
    const velocities = new Float32Array(params['point_n'] * 3);
    const colors = new Float32Array(params['point_n']);

    for (let i = 0; i < params['point_n']; ++i) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = 0.0; // 2D for now

      velocities[i * 3] = 0.0;
      velocities[i * 3 + 1] = 0.0;
      velocities[i * 3 + 2] = 0.0;

      colors[i] = i % params.K;
    }

    // console.log(positions);
    device.queue.writeBuffer(positionsBuffer, 0, positions);
    device.queue.writeBuffer(velocitiesBuffer, 0, velocities);
    device.queue.writeBuffer(colorsBuffer, 0, colors);
  }

  // set the F matrix
  const F = new Float32Array(params.K * params.K);
  for (let i = 0; i < params.K; ++i) {
    for (let j = 0; j < params.K; ++j) {
      F[i * params.K + j] = (i == j) + 0.1*(i==(j+1)%(params.K))
    }
  }

  function updateParams() {
    device.queue.writeBuffer(paramsBuffer, 0, new Float32Array(Object.values(params)));
  }

  resetBuffers();
  updateParams();

  // SHADERS

  const computeShader = device.createShaderModule({
    label: 'Particle Life Compute Shader',
    code: compute_shader,
  });


  // PIPELINES

  const computeVelocitiesPipeline = device.createComputePipeline({
    label: 'compute velocities pipeline',
    layout: 'auto',
    compute: {
      module: computeShader,
      entryPoint: 'update_velocities',
    },
  });

  const updatePositionsPipeline = device.createComputePipeline({
    label: 'update positions pipeline',
    layout: 'auto',
    compute: {
      module: computeShader,
      entryPoint: 'update_positions',
    },
  });

  // BIND GROUPS

  const computeVelocitiesBindGroup = device.createBindGroup({
    layout: computeVelocitiesPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: colorsBuffer } },
      { binding: 1, resource: { buffer: velocitiesBuffer } },
      { binding: 2, resource: { buffer: positionsBuffer } },
      { binding: 3, resource: { buffer: FBuffer } },
    ],
  });

  const paramsBindGroup = device.createBindGroup({
    layout: computeVelocitiesPipeline.getBindGroupLayout(1),
    entries: [
      { binding: 0, resource: { buffer: paramsBuffer } },
    ],
  });

  // GPU SIMULATION

  async function step() {
    // make a command encoder to start encoding commands
    const encoder = device.createCommandEncoder({ label: 'our command encoder' });

    const pass_0 = encoder.beginComputePass();
    // make a compute pass for calculating the new velocities
    pass_0.setPipeline(computeVelocitiesPipeline);
    pass_0.setBindGroup(0, computeVelocitiesBindGroup);
    pass_0.setBindGroup(1, paramsBindGroup);
    pass_0.dispatchWorkgroups(params.n_agents / 64);

    pass_0.end();

    const pass_1 = encoder.beginComputePass();
    // make a compute pass for updating the positions
    pass_1.setPipeline(updatePositionsPipeline);
    pass_1.setBindGroup(0, computeVelocitiesBindGroup);
    pass_1.setBindGroup(1, paramsBindGroup);
    pass_1.dispatchWorkgroups(params.n_agents / 64);
    pass_1.end();
    // encoder.copyBufferToBuffer(positionsBuffer, 0, positionsResultBuffer, 0, positionsResultBuffer.size);

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);

  }

  // ANIMATION
  async function animate(ctx, world_width = params.world_extent, steps_per_frame = 1) {
    for (let i = 0; i < steps_per_frame; ++i) {
      await step();
    }

    // await positionsResultBuffer.mapAsync(GPUMapMode.READ);
    // const positions = new Float32Array(positionsResultBuffer.getMappedRange());

    const { width, height } = ctx.canvas;
    ctx.resetTransform();
    ctx.clearRect(0, 0, width, height);
    ctx.translate(width / 2, height / 2);
    const s = width / world_width;
    ctx.scale(s, s);
    ctx.lineWidth = 0.05;
    for (let i = 0; i < params['point_n']; ++i) {
      ctx.beginPath();
      const x = positions[i * 3], y = positions[i * 3 + 1];

      ctx.arc(x, y, 0.075, 0.0, Math.PI * 2);
      ctz.fillStyle = `hsl(${colors[i] * 360 / params.K}, 100%, 50%)`;
      ctx.fill();
      ctx.stroke();
    }
    // positionsResultBuffer.unmap();
  }

  let gui = new GUI();
  gui.add(params, "repulsion").min(0.1).max(5).step(0.1);
  gui.add(params, "inertia").min(0.01).max(1).step(0.01);
  gui.add(params, "dt").min(0.01).max(1).step(0.01);
  gui.add(params, "world_extent").min(5).max(30).step(1);
  gui.add(params, "resetBuffers");
  gui.onChange(updateParams);

  // MAIN LOOP
  const ctx = resizeCanvas();
  while (true) {
    await animate(ctx);
    await new Promise(requestAnimationFrame);
  }
}

function setupCanvas(canvas) {
  // Get the device pixel ratio, falling back to 1.
  let dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  let rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  let ctx = canvas.getContext('2d');
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the scaling in your drawing code.
  ctx.scale(dpr, dpr);



  return ctx;

  // Now you can just draw at the "normal" size.
}

function resizeCanvas() {
  let ctx = setupCanvas(document.querySelector('canvas'));
  // Redraw canvas content after resizing here
  return ctx;
}

main();




