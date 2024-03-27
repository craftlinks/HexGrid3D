import { createShader, render } from "./lib.js";

/////////////////////////////////////////////////////////
// GPU and CPU Settings

// Sizes in bytes
const sizes = {
  f32: 4,
  u32: 4,
  i32: 4,
  vec2: 8,
  vec3: 12,
  vec4: 16,
};



const uniforms = {
  rez: 1024 ,
  time: 0,
  dt: 0.02,
  frictionFactor: 0,
  rMax: 128,
  m:12,
  matrix: [],
  count: 2 * 100000,
  binSidelength: 312,
  binCapacity: 900,
};

function makeRandomMatrix() {
  let matrix = [];
  for (let i = 0; i < uniforms.m; i++) {
    const row = [];
    for (let j = 0; j < uniforms.m; j++) {
      // i == j ? row.push(1) : (i == j + 1) ? row.push(0.1) : row.push(0);
      row.push(Math.random() * 2 - 1);
    }
    matrix.push(row);
  }
  return matrix;
}

uniforms.binsPerSide = Math.ceil(uniforms.rez / uniforms.binSidelength);
uniforms.frictionFactor = Math.pow(0.5, uniforms.dt/0.04);
uniforms.matrix = makeRandomMatrix();

// CPU-only settings
const settings = {
  binCount: uniforms.binsPerSide ** 2,
  scale:
    (0.95 * Math.min(window.innerHeight, window.innerWidth)) / uniforms.rez,
  pixelWorkgroups: Math.ceil(uniforms.rez ** 2 / 256),
  agentWorkgroups: Math.ceil(uniforms.count / 256),
};

/////////////////////////////////////////////////////////
// Main
async function main() {
  ///////////////////////
  // Initial setup
  const adapter = await navigator.gpu.requestAdapter();
  const gpu = await adapter.requestDevice();

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = uniforms.rez * settings.scale;
  document.body.appendChild(canvas);
  const context = canvas.getContext("webgpu");
  const format = "bgra8unorm";
  context.configure({
    device: gpu,
    format: format,
    alphaMode: "premultiplied",
  });

  /////////////////////////
  // Set up memory resources
  const visibility = GPUShaderStage.COMPUTE;

  // Pixel buffer
  const pixelBuffer = gpu.createBuffer({
    size: uniforms.rez ** 2 * sizes.vec4,
    usage: GPUBufferUsage.STORAGE,
  });
  const pixelBufferLayout = gpu.createBindGroupLayout({
    entries: [{ visibility, binding: 0, buffer: { type: "storage" } }],
  });
  const pixelBufferBindGroup = gpu.createBindGroup({
    layout: pixelBufferLayout,
    entries: [{ binding: 0, resource: { buffer: pixelBuffer } }],
  });

  // Uniform buffers
  const rezBuffer = gpu.createBuffer({
    size: sizes.f32,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  });
  const timeBuffer = gpu.createBuffer({
    size: sizes.f32,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  });
  gpu.queue.writeBuffer(timeBuffer, 0, new Float32Array([uniforms.time]));
  const countBuffer = gpu.createBuffer({
    size: sizes.f32,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  });
  const dtBuffer = gpu.createBuffer({
    size: sizes.f32,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  });
  const frictionFactorBuffer = gpu.createBuffer({
    size: sizes.f32,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  });
  const rMaxBuffer = gpu.createBuffer({
    size: sizes.f32,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  });
  const mBuffer = gpu.createBuffer({
    size: sizes.f32,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  });
  const binSidelengthBuffer = gpu.createBuffer({
    size: sizes.f32,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  });
  const binCapacityBuffer = gpu.createBuffer({
    size: sizes.f32,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  });
  const binsPerSideBuffer = gpu.createBuffer({
    size: sizes.f32,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  });

  const uniformsLayout = gpu.createBindGroupLayout({
    entries: [
      { visibility, binding: 0, buffer: { type: "uniform" } }, // rez
      { visibility, binding: 1, buffer: { type: "uniform" } }, // time
      { visibility, binding: 2, buffer: { type: "uniform" } }, // count
      { visibility, binding: 3, buffer: { type: "uniform" } }, // dt
      { visibility, binding: 4, buffer: { type: "uniform" } }, // frictionFactor
      { visibility, binding: 5, buffer: { type: "uniform" } }, // rMax
      { visibility, binding: 6, buffer: { type: "uniform" } }, // m
      { visibility, binding: 7, buffer: { type: "uniform" } }, // binSidelength
      { visibility, binding: 8, buffer: { type: "uniform" } }, // binCapacity
      { visibility, binding: 9, buffer: { type: "uniform" } },// binsPerSide
    ],
  });

  const uniformsBuffersBindGroup = gpu.createBindGroup({
    layout: uniformsLayout,
    entries: [
      { binding: 0, resource: { buffer: rezBuffer } },
      { binding: 1, resource: { buffer: timeBuffer } },
      { binding: 2, resource: { buffer: countBuffer } },
      { binding: 3, resource: { buffer: dtBuffer } },
      { binding: 4, resource: { buffer: frictionFactorBuffer } },
      { binding: 5, resource: { buffer: rMaxBuffer } },
      { binding: 6, resource: { buffer: mBuffer } },
      { binding: 7, resource: { buffer: binSidelengthBuffer } },
      { binding: 8, resource: { buffer: binCapacityBuffer } },
      { binding: 9, resource: { buffer: binsPerSideBuffer } },
    ],
  });

  const writeUniforms = () => {
    gpu.queue.writeBuffer(rezBuffer, 0, new Float32Array([uniforms.rez]));
    gpu.queue.writeBuffer(countBuffer, 0, new Uint32Array([uniforms.count]));
    gpu.queue.writeBuffer(dtBuffer, 0, new Float32Array([uniforms.dt]));
    gpu.queue.writeBuffer(frictionFactorBuffer, 0, new Float32Array([uniforms.frictionFactor]));
    gpu.queue.writeBuffer(rMaxBuffer, 0, new Float32Array([uniforms.rMax]));
    gpu.queue.writeBuffer(mBuffer, 0, new Uint32Array([uniforms.m]));
    gpu.queue.writeBuffer(binSidelengthBuffer, 0, new Float32Array([uniforms.binSidelength]));
    gpu.queue.writeBuffer(binCapacityBuffer, 0, new Uint32Array([uniforms.binCapacity]));
    gpu.queue.writeBuffer(binsPerSideBuffer, 0, new Uint32Array([uniforms.binsPerSide]));

    settings.agentWorkgroups = Math.ceil(uniforms.count / 256);
  };

  writeUniforms();

  // Other buffers
  const positionsBuffer = gpu.createBuffer({
    size: sizes.vec3 * uniforms.count,
    usage: GPUBufferUsage.STORAGE,
  });
  const velocitiesBuffer = gpu.createBuffer({
    size: sizes.vec3 * uniforms.count,
    usage: GPUBufferUsage.STORAGE,
  });

  const binsBuffer = gpu.createBuffer({
    size: sizes.f32 * settings.binCount * uniforms.binCapacity,
    usage: GPUBufferUsage.STORAGE,
  });

  const binCountsBuffer = gpu.createBuffer({
    size: sizes.f32 * settings.binCount,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  // Probably better to use a Uniform for this... 
  const matrixBuffer = gpu.createBuffer({
    size: sizes.f32 * uniforms.m * uniforms.m,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  
  // Initialize the matrix buffer{
  {
    const F = new Float32Array(uniforms.matrix.flat());
    gpu.queue.writeBuffer(matrixBuffer, 0, F);
  }

  const colorsBuffer = gpu.createBuffer({
    size: sizes.f32 * uniforms.count,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  // Initialize the colors buffer
  {
    const colors = new Uint32Array(uniforms.count);
    for (let i = 0; i < uniforms.count; i++) {
      colors[i] = i % uniforms.m;
    }
    console.log(colors);
    gpu.queue.writeBuffer(colorsBuffer, 0, colors);
  }

  const agentsLayout = gpu.createBindGroupLayout({
    entries: [
      { visibility, binding: 0, buffer: { type: "storage" } }, // positions
      { visibility, binding: 1, buffer: { type: "storage" } }, // velocities
      { visibility, binding: 2, buffer: { type: "storage" } }, // colors
      { visibility, binding: 3, buffer: { type: "storage" } }, // bins
      { visibility, binding: 4, buffer: { type: "storage" } }, // binCounts
      { visibility, binding: 5, buffer: { type: "storage" } }, // force matrix
    ],
  });

  const agentsBuffersBindGroup = gpu.createBindGroup({
    layout: agentsLayout,
    entries: [
      { binding: 0, resource: { buffer: positionsBuffer } },
      { binding: 1, resource: { buffer: velocitiesBuffer } },
      { binding: 2, resource: { buffer: colorsBuffer } },
      { binding: 3, resource: { buffer: binsBuffer } },
      { binding: 4, resource: { buffer: binCountsBuffer } },
      { binding: 5, resource: { buffer: matrixBuffer } },
    ],
  });

  /////
  // Overall memory layout
  const layout = gpu.createPipelineLayout({
    bindGroupLayouts: [pixelBufferLayout, uniformsLayout, agentsLayout],
  });

  /////////////////////////
  // Set up code instructions
  const module = await createShader(gpu, "./shaders/agents.wgsl");

  const resetPipeline = gpu.createComputePipeline({
    layout,
    compute: { module, entryPoint: "reset" },
  });

  const writeBinsPipeline = gpu.createComputePipeline({
    layout,
    compute: { module, entryPoint: "writeBins" },
  });

  const simulatePipeline = gpu.createComputePipeline({
    layout,
    compute: { module, entryPoint: "simulate" },
  });

  const fadePipeline = gpu.createComputePipeline({
    layout,
    compute: { module, entryPoint: "fade" },
  });

  /////////////////////////
  // RUN the reset shader function
  const reset = () => {
    const encoder = gpu.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(resetPipeline);
    pass.setBindGroup(0, pixelBufferBindGroup);
    pass.setBindGroup(1, uniformsBuffersBindGroup);
    pass.setBindGroup(2, agentsBuffersBindGroup);
    pass.dispatchWorkgroups(settings.agentWorkgroups);
    pass.end();
    gpu.queue.submit([encoder.finish()]);
  };
  reset();

  let time = document.querySelector("#time");
  let fps = document.querySelector("#fps");
  /////////////////////////
  // RUN the sim compute function and render pixels
  const draw = async () => {
    let start = performance.now();

    const encoder = gpu.createCommandEncoder();
    encoder.clearBuffer(binCountsBuffer, 0, binCountsBuffer.byteLength);

    {
      const pass = encoder.beginComputePass();
      pass.setBindGroup(0, pixelBufferBindGroup);
      pass.setBindGroup(1, uniformsBuffersBindGroup);
      pass.setBindGroup(2, agentsBuffersBindGroup);

      pass.setPipeline(writeBinsPipeline);
      pass.dispatchWorkgroups(settings.agentWorkgroups);

      pass.end();
    }

    {
      const pass = encoder.beginComputePass();
      pass.setBindGroup(0, pixelBufferBindGroup);
      pass.setBindGroup(1, uniformsBuffersBindGroup);
      pass.setBindGroup(2, agentsBuffersBindGroup);

      pass.setPipeline(fadePipeline);
      pass.dispatchWorkgroups(settings.pixelWorkgroups);

      pass.setPipeline(simulatePipeline);
      pass.dispatchWorkgroups(settings.agentWorkgroups);

      pass.end();
    }

    // Render the pixels buffer to the canvas
    render(gpu, uniforms.rez, pixelBuffer, format, context, encoder);

    gpu.queue.submit([encoder.finish()]);
    await gpu.queue.onSubmittedWorkDone();

    gpu.queue.writeBuffer(timeBuffer, 0, new Float32Array([uniforms.time++]));

    let elapsed = performance.now() - start;
    time.textContent = `${elapsed}ms  (${Math.round(1000 / elapsed)}fps)`;
    setTimeout(draw, 0);
  };
  draw();

  let gui = new lil.GUI();
  gui.add(uniforms, "dt").min(0.01).max(0.5);
  gui.add(uniforms, "rMax").min(0.01).max(0.9);
  gui.add(uniforms, "m").min(1).max(24);
  gui.add(uniforms, "count").min(1).max(uniforms.count).step(1);
  gui.onChange(writeUniforms);
}
main();
