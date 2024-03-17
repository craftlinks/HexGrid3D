import GUI from 'lil-gui';


async function main() {

  let params = {
    mu_k: 3.8,
    sigma_k: 0.4,
    w_k: 0.037,
    mu_g: 2.23,
    sigma_g: 0.1,
    c_rep: 0.84,
    dt: 0.01,
    point_n: 50 * 64,
    resetBuffers: () => { resetBuffers(); }
  }

  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    fail('need a browser that supports WebGPU');
    return;
  }
  else {
    console.log('WebGPU is supported');
  }

  var canvas = document.querySelector('canvas')
  const compute_shader = await fetch('./shaders/lenia_compute.wgsl').then((response) => response.text());


  // BUFFERS

  const paramsBuffer = device.createBuffer({
    size: Object.keys(params).length * 4, // 4 bytes per float
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  });


  const RvalBuffer = device.createBuffer({
    label: 'Rval buffer',
    size: params.point_n * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const UvalBuffer = device.createBuffer({
    label: 'Uval buffer',
    size: params.point_n * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const RgradBuffer = device.createBuffer({
    label: 'Rgrad buffer',
    size: params.point_n * 2 * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const UgradBuffer = device.createBuffer({
    label: 'Ugrad buffer',
    size: params.point_n * 2 * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const PositionBuffer = device.createBuffer({
    label: 'Position buffer',
    size: params.point_n * 2 * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  });

  const PositionBufferResult = device.createBuffer({
    label: 'Position buffer result',
    size: params.point_n * 2 * 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });


  // INITIALIZE BUFFERS

  let resetBuffers = () => {
    const positions = new Float32Array(params['point_n'] * 2);

    for (let i = 0; i < params['point_n']; ++i) {
      positions[i * 2] = (Math.random() - 0.5) * 24;
      positions[i * 2 + 1] = (Math.random() - 0.5) * 24;
    }
    // console.log(positions);
    device.queue.writeBuffer(PositionBuffer, 0, positions);
  }

  function updateParams() {
    device.queue.writeBuffer(paramsBuffer, 0, new Float32Array(Object.values(params)));
  }

  resetBuffers();
  updateParams();

  // SHADERS

  const computeShader = device.createShaderModule({
    label: 'Lenia Compute Shader',
    code: compute_shader,
  });


  // PIPELINES

  const resetPipeline = device.createComputePipeline({
    label: 'reset pipeline',
    layout: 'auto',
    compute: {
      module: computeShader,
      entryPoint: 'reset_buffers',
    },
  });

  const computeFieldsPipeline = device.createComputePipeline({
    label: 'compute fields pipeline',
    layout: 'auto',
    compute: {
      module: computeShader,
      entryPoint: 'compute_fields',
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

  const computeFieldsBindGroup = device.createBindGroup({
    layout: computeFieldsPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: RvalBuffer } },
      { binding: 1, resource: { buffer: UvalBuffer } },
      { binding: 2, resource: { buffer: RgradBuffer } },
      { binding: 3, resource: { buffer: UgradBuffer } },
      { binding: 4, resource: { buffer: PositionBuffer } },
    ],
  });

  const paramsBindGroup = device.createBindGroup({
    layout: computeFieldsPipeline.getBindGroupLayout(1),
    entries: [
      { binding: 0, resource: { buffer: paramsBuffer } },
    ],
  });

  // GPU SIMULATION

  async function step() {
    // make a command encoder to start encoding commands
    const encoder = device.createCommandEncoder({ label: 'our command encoder' });

    const pass_0 = encoder.beginComputePass();
    pass_0.setPipeline(resetPipeline);
    pass_0.setBindGroup(0, computeFieldsBindGroup);
    pass_0.setBindGroup(1, paramsBindGroup);
    pass_0.dispatchWorkgroups(params.point_n / 64);


    // make a compute pass for calculating the fields
    pass_0.setPipeline(computeFieldsPipeline);
    pass_0.setBindGroup(0, computeFieldsBindGroup);
    pass_0.setBindGroup(1, paramsBindGroup);
    pass_0.dispatchWorkgroups(params.point_n / 64);


    // make a compute pass for updating the positions
    pass_0.setPipeline(updatePositionsPipeline);
    pass_0.setBindGroup(0, computeFieldsBindGroup);
    pass_0.setBindGroup(1, paramsBindGroup);
    pass_0.dispatchWorkgroups(params.point_n / 64);
    pass_0.end();
    encoder.copyBufferToBuffer(PositionBuffer, 0, PositionBufferResult, 0, PositionBufferResult.size);

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);

  }

  // ANIMATION
  async function animate(ctx, world_width = 100.0, steps_per_frame = 5) {
    for (let i = 0; i < steps_per_frame; ++i) {
      await step();
    }

    await PositionBufferResult.mapAsync(GPUMapMode.READ);
    const positions = new Float32Array(PositionBufferResult.getMappedRange());

    // console.log(positions);

    const { width, height } = ctx.canvas;
    ctx.resetTransform();
    ctx.clearRect(0, 0, width, height);
    ctx.translate(width / 2, height / 2);
    const s = width / world_width;
    ctx.scale(s, s);
    ctx.lineWidth = 0.05;
    for (let i = 0; i < params['point_n']; ++i) {
      ctx.beginPath();
      const x = positions[i * 2], y = positions[i * 2 + 1];
      // const r = params.c_rep / (fields.R_val[i]*5.0);
      ctx.arc(x, y, 0.075, 0.0, Math.PI * 2);
      ctx.stroke();
    }
    PositionBufferResult.unmap();
  }

  let gui = new GUI();
  gui.add(params, "mu_k").min(0.01).max(10).step(0.01);
  gui.add(params, "sigma_k").min(0.01).max(10).step(0.01);
  gui.add(params, "w_k").min(0.001).max(10).step(0.001);
  gui.add(params, "mu_g").min(0.01).max(10).step(0.01);
  gui.add(params, "sigma_g").min(0.01).max(10).step(0.01);
  gui.add(params, "c_rep").min(0.01).max(3).step(0.01);
  gui.add(params, "dt").min(0.01).max(0.25).step(0.01);
  gui.add(params, "point_n").min(64).max(12800).step(64);
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




