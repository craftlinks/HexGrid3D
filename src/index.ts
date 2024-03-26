
async function main() {
  let dt = 0.001;
  let params = {
    dt: dt,
    n: 64 * 250,
    frictionFactor: Math.pow(0.5, dt/0.04),
    rMax: 0.25,
    m: 6,
    opacity: 50,
    particleSize: 2.0 
  }

  // GPU SETUP
  const adapter = await navigator.gpu?.requestAdapter();
  const presentationFormat = navigator?.gpu.getPreferredCanvasFormat(adapter);
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
  const render_shader = await fetch('./shaders/render.wgsl').then((response) => response.text());


  // Simulation setup

  // // set the F matrix
  // const F = new Float32Array(params.m * params.m);
  // for (let i = 0; i < params.m; ++i) {
  //   for (let j = 0; j < params.m; ++j) {
  //     i == j ? F. : (i == j + 1) ? row.push(0.1) : row.push(0);
  //     F[i + params.m * j] = base + 0.1*(base_2%(params.m))
  //   }
  // }
  let matrix = [];
  for (let i = 0; i < params.m; i++) {
    const row = [];
    for (let j = 0; j < params.m; j++) {
      i == j ? row.push(1) : (i == (j + 1)%params.m) ? row.push(0.1) : row.push(0);
      // row.push(Math.random() * 2 - 1);
    }
    matrix.push(row);
  }
  const F = new Float32Array(matrix.flat());
  console.log(F);

  const colors = new Uint32Array(params.n);
  const positions = new Float32Array(params.n * 4 );
  const velocities = new Float32Array(params.n * 3);

  for (let i = 0; i < params.n; i++) {
    colors[i] = i % params.m; // 0 - (m-1)
    positions[4*i] = Math.random() * 2 - 1; // -1:1
    positions[4*i+1] = Math.random() * 2 -1; // -1:1
    positions[4*i+2] = Math.random() * 2 -1; // -1:1
    positions[4*i+3] = 1.0; // w
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
    size: params.m * params.m * 4,
    usage:  GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  }); // attraction/repulsion matrix

  const colorsBuffer = device.createBuffer({
    label: 'colors buffer',
    size: params.n * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  }); // agent color

  const velocitiesBuffer = device.createBuffer({
    label: 'velocities buffer',
    size: params.n * 3 * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const positionsBuffer = device.createBuffer({
    label: 'positions buffer',
    size: params.n * 4 * 4,
    usage:GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
  });

  const positionsResultBuffer = device.createBuffer({
    label: 'Position buffer result',
    size: params.n * 4 * 4,
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

  // BUFFERS FOR RENDERING

  const vertexBuffer = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  });
  device.queue.writeBuffer(vertexBuffer, 0, new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    1.0, 1.0
  ]));

  const RGBColorBufferData = new Uint8Array(4 * params.n);
  for (let i = 0; i < params.n; i += 1) {
    const rgbValues = HSLToRGB(360 * 1 / params.m * colors[i], 100, 50)
    RGBColorBufferData[i*4] = rgbValues[0];
    RGBColorBufferData[i*4 + 1] = rgbValues[1];
    RGBColorBufferData[i*4 + 2] = rgbValues[2];
    RGBColorBufferData[i*4 + 3] = Math.floor(params.opacity / 100 * 255);
  }

  const RGBColorBuffer = device.createBuffer({
    size: RGBColorBufferData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(RGBColorBuffer, 0, RGBColorBufferData);

  const vertexUniformBuffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });

  // SHADERS

  const computeShader = device.createShaderModule({
    label: 'Particle Life Compute Shader',
    code: compute_shader,
  });

  const renderShaderModule = device.createShaderModule({
    label: 'render shader',
    code: render_shader,
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

  const renderPipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: renderShaderModule,
      entryPoint: "vs",
      buffers: [
        {
          arrayStride: 8,
          attributes: [{
            shaderLocation: 0,
            format: "float32x2",
            offset: 0
          }]
        },
        {
          arrayStride: 4,
          stepMode: "instance",
          attributes: [{
            shaderLocation: 1,
            format: "unorm8x4",
            offset: 0
          }]
        },
        {
          arrayStride: 16,
          stepMode: "instance",
          attributes: [{
            shaderLocation: 2,
            format: "float32x4",
            offset: 0
          }]
        }
      ]
    },
    fragment: {
      module: renderShaderModule,
      entryPoint: "fs",
      targets: [{
        format: presentationFormat,
        blend: {
          color: {
            srcFactor: "one",
            dstFactor: "one-minus-src-alpha"
          },
          alpha: {
            srcFactor: "one",
            dstFactor: "one-minus-src-alpha"
          }
        }
      }]
    },
    primitive: {
      topology: "triangle-strip",
      stripIndexFormat: "uint32"
    }
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

  const vertexUniformBindGroup = device.createBindGroup({
    layout: renderPipeline.getBindGroupLayout(0),
    entries: [{
      binding: 0,
      resource: {
        buffer: vertexUniformBuffer
      }
    }]
  });

  // Render pass descriptor
  
  const ctx = resizeCanvas();
  
  const renderPassDescriptor = {
    colorAttachments: [{
      view: ctx!.getCurrentTexture().createView(),
      loadOp: "clear",
      storeOp: "store",
      clearValue: [0, 0, 0, 1]
    }]
  };

  // GPU SIMULATION

  function step(encoder) {
    // make a command encoder to start encoding commands
    const screenRatio = ctx.canvas.width / ctx.canvas.height;
    device.queue.writeBuffer(vertexUniformBuffer, 0, new Float32Array([
      canvas!.width, canvas!.height, params.particleSize, screenRatio
    ]));

    const pass_0 = encoder.beginComputePass();
    // make a compute pass for calculating the new velocities
    pass_0.setPipeline(computeVelocitiesPipeline);
    pass_0.setBindGroup(0, computeVelocitiesBindGroup);
    pass_0.setBindGroup(1, paramsBindGroup);
    pass_0.dispatchWorkgroups(params.n / 64);
    pass_0.end();


    // make a compute pass for updating the positions
    const pass_1 = encoder.beginComputePass();
    pass_1.setPipeline(updatePositionsPipeline);
    pass_1.setBindGroup(0, computeVelocitiesBindGroup);
    pass_1.setBindGroup(1, paramsBindGroup);
    pass_1.dispatchWorkgroups(params.n / 64);
    pass_1.end();

    // make a render pass for rendering the particles
    renderPassDescriptor.colorAttachments[0].view = ctx!.getCurrentTexture().createView();
    const renderPass = encoder.beginRenderPass(renderPassDescriptor);
    renderPass.setPipeline(renderPipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.setVertexBuffer(1, RGBColorBuffer);
    renderPass.setVertexBuffer(2, positionsBuffer);
    renderPass.setBindGroup(0, vertexUniformBindGroup);

    renderPass.draw(4, params.n);
    renderPass.end();
    
  }

  // -- RENDERING ---

  async function animate(ctx, steps_per_frame=1) {
    const encoder = device.createCommandEncoder({ label: 'our command encoder' });
    
    for (let i=0; i<steps_per_frame; ++i) {step(encoder);}
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  
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
    let ctx = canvas.getContext('webgpu');
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the scaling in your drawing code.
    // ctx.scale(dpr, dpr);
    (ctx! as any).configure({
      device,
      format: presentationFormat
    });
    return ctx;

    // Now you can just draw at the "normal" size.
  }

  function resizeCanvas() {
    let ctx = setupCanvas(document.querySelector('canvas'));
    // Redraw canvas content after resizing here
    return ctx;
  }

  while (true) {
    await animate(ctx);
    await new Promise(requestAnimationFrame);
  }
}

main();


function HSLToRGB(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return [r, g, b];
}