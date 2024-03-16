import { params } from './simulation';

async function main() {

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

  {
    const positions = new Float32Array(params['point_n'] * 2);

    for (let i = 0; i < params['point_n']; ++i) {
      positions[i * 2] = (Math.random() - 0.5) * 12;
      positions[i * 2 + 1] = (Math.random() - 0.5) * 12;
    }
    // console.log(positions);
    device.queue.writeBuffer(PositionBuffer, 0, positions);
  }

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

  // GPU SIMULATION

  async function step() {
    // make a command encoder to start encoding commands
    const encoder = device.createCommandEncoder({ label: 'our command encoder' });

    const pass_0 = encoder.beginComputePass();
    pass_0.setPipeline(resetPipeline);
    pass_0.setBindGroup(0, computeFieldsBindGroup);
    pass_0.dispatchWorkgroups(params.point_n / 64);
    pass_0.end();

    // make a compute pass for calculating the fields
    const pass_1 = encoder.beginComputePass();
    pass_1.setPipeline(computeFieldsPipeline);
    pass_1.setBindGroup(0, computeFieldsBindGroup);
    pass_1.dispatchWorkgroups(params.point_n / 64);
    pass_1.end();

    // make a compute pass for updating the positions
    const pass_2 = encoder.beginComputePass();
    pass_2.setPipeline(updatePositionsPipeline);
    pass_2.setBindGroup(0, computeFieldsBindGroup);
    pass_2.dispatchWorkgroups(params.point_n / 64);
    pass_2.end();
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




