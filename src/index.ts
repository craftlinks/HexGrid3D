
async function main() {

  let params = {
    dt: 0.02,
    n: 1500,
    frictionFactor: Math.pow(0.5, dt/0.04),
    rMax: 0.25,
    m: 6,  
  }

  // GPU SETUP
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


  // Simulation setup

  // set the F matrix
  const F = new Float32Array(params.K * params.K);
  for (let i = 0; i < params.K; ++i) {
    for (let j = 0; j < params.K; ++j) {
      let base = (i == j) ? 1 : 0;
      let base_2 = (i == j + 1) ? 1 : 0; 
      F[i + params.K * j] = base + 0.1*(base_2%(params.K))
    }
  }

  const colors = new Uint32Array(params.n);
  const positions = new Float32Array(params.n * 3 );
  const velocities = new Float32Array(params.n * 3);

  for (let i = 0; i < params.n; i++) {
    colors[i] = i % params.m; // 0 - (m-1)
    positions[3*i] = Math.random(); // -1:1
    positions[3*i+1] = Math.random(); // -1:1
    positions[3*i+2] = Math.random(); // -1:1
    velocities[3*i] = 0.0;
    velocities[3*i+1] = 0.0;
    velocities[3*i+2] = 0.0;
  }

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
  device.queue.writeBuffer(positionsBuffer, 0, positions);
  device.queue.writeBuffer(velocitiesBuffer, 0, velocities);
  device.queue.writeBuffer(colorsBuffer, 0, colors);
  device.queue.writeBuffer(FBuffer, 0, F);

  function updateParams() {
    device.queue.writeBuffer(paramsBuffer, 0, new Float32Array(Object.values(params)));
  }
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
    encoder.copyBufferToBuffer(positionsBuffer, 0, positionsResultBuffer, 0, positionsResultBuffer.size);

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  }

  // -- RENDERING ---

  async function animate(ctx, steps_per_frame=1) {
    for (let i=0; i<steps_per_frame; ++i) await step();
    
    await positionsResultBuffer.mapAsync(GPUMapMode.READ);
    const positions = new Float32Array(positionsResultBuffer.getMappedRange());
    
    const {width, height} = ctx.canvas;
    ctx.resetTransform();
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 0.1;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    for (let i=0; i<n; ++i) {
      ctx.beginPath();
      const x=(positions[i*3]) * width , y=(positions[i*3+1]) * height
      ctx.arc(x, y, 6.0, 0.0, Math.PI*2);
      ctx.fillStyle = `hsl(${colors[i]*360/m}, 100%, 50%)`;
      ctx.fill();
      ctx.stroke();        
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

  const ctx = resizeCanvas();
  while (true) {
    animate(ctx);
    await new Promise(requestAnimationFrame);
  }
}

main();