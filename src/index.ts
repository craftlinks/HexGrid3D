import { simulation } from './simulation/simulation';

async function main() {
  // Constants
  const hexGridDimensions = [64.0, 64.0];
  const hexSize = 1.0 / (Math.max(hexGridDimensions[0], hexGridDimensions[1]));

  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    fail('need a browser that supports WebGPU');
    return;
  }
  else {
    console.log('WebGPU is supported');
  }

  // Get a WebGPU context from the canvas and configure it
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('webgpu');
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
  });

  // open vertex and fragment shaders as text
  const vert_hexgrid = await fetch('./shaders/hexgrid3d_vertex.wgsl').then((response) => response.text());
  const frag_hexgrid = await fetch('./shaders/hexgrid3d_fragment.wgsl').then((response) => response.text());

  // create the shaders
  const vertexShader = device.createShaderModule({
    label: 'HexGrid3D vertex shader',
    code: vert_hexgrid,
  });

  const fragmentShader = device.createShaderModule({
    label: 'HexGrid3D fragment shader',
    code: frag_hexgrid,
  });

  // -- Buffers -- //

  const hexAttributeUnitSize =
    2 * 4; // offset is 2 32bit floats (4bytes each)
  const colorUnitSize = 4 * 4; // color is 4 32bit floats (4bytes each)

  const GlobalAttributesUnitSize =
    2 * 4 +  // scale is 2 32bit floats (4bytes each)
    2 * 4;   // grid_width and grid_height are 2 32bit floats (4bytes each)

  const stateUnitSize = 1 * 4; // 24 x 32bit unsigned int (4bytes each): Histogram of bins

  const hexAttributesStorageBufferSize = hexGridDimensions[0] * hexGridDimensions[1] * hexAttributeUnitSize;
  const globalAttributesBufferSize = GlobalAttributesUnitSize;
  const stateBufferSize = hexGridDimensions[0] * hexGridDimensions[1] * stateUnitSize; // each cell has a histogram of 24 bins

  const hexAttributesStorageBuffer = device.createBuffer({
    label: `Hex attributes storage buffer for objects`,
    size: hexAttributesStorageBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const globalAttributesBuffer = device.createBuffer({
    label: `global attributes uniform`,
    size: globalAttributesBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // offsets to the various uniform values in float32 indices
  const kScaleOffset = 0;
  const kGridDimensionsOffset = 2;

  // Hex cell offsets (for rendering)
  {
    const hexAttributesStorageValues = new Float32Array(hexAttributesStorageBufferSize / 4);
    for (let i = 0; i < hexGridDimensions[0] * hexGridDimensions[1]; ++i) {
      const bufferOffset = i * (hexAttributeUnitSize / 4);
      let x = i % hexGridDimensions[0];
      let y = Math.floor(i / hexGridDimensions[0]);
      y % 2 == 1 ? x : x += 0.5;
      // These are only set once so set them now
      hexAttributesStorageValues.set([x * Math.sqrt(3) * hexSize, y * 3 / 2 * hexSize], bufferOffset);      // set the offset
    }
    device.queue.writeBuffer(hexAttributesStorageBuffer, 0, hexAttributesStorageValues);
  }

  const stateBuffer_0 = device.createBuffer({
    label: `state buffer 0`,
    size: stateBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });


  // Initialize the state buffer with some values

  const stateValues_0 = new Int32Array(stateBufferSize / 4);
  const stateValues_1 = new Int32Array(stateBufferSize / 4);
  for (let i = 0; i < hexGridDimensions[0] * hexGridDimensions[1]; ++i) {
    const bufferOffset = i * (stateUnitSize / 4);
    if (i  == hexGridDimensions[0] * hexGridDimensions[1] / 2 + hexGridDimensions[0] / 2) {
    //if (Math.random() < 0.1) {
      stateValues_0.set([96], bufferOffset);
      stateValues_1.set(stateValues_0);
    }
  }

  


  // setup a storage buffer with vertex data
  const { vertexData, numVertices } = createHexagonVertices({
    hexSize,
    center: { x: -1 - hexSize, y: -1 + hexSize },
  });

  const vertexStorageBuffer = device.createBuffer({
    label: 'storage buffer vertices',
    size: vertexData.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexStorageBuffer, 0, vertexData);

  // GPU pipelines

  // create the render pipeline
  const render_pipeline = device.createRenderPipeline({
    label: 'HexGrid3D pipeline',
    layout: 'auto',
    vertex: {
      module: vertexShader,
      entryPoint: 'vs',
    },
    fragment: {
      module: fragmentShader,
      entryPoint: 'fs',
      targets: [{ format: presentationFormat }],
    },
  });

  const renderBindGroup_0 = device.createBindGroup({
    label: 'flip bind group for objects',
    layout: render_pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: hexAttributesStorageBuffer } },
      { binding: 1, resource: { buffer: stateBuffer_0 } },
      { binding: 2, resource: { buffer: globalAttributesBuffer } },
      { binding: 3, resource: { buffer: vertexStorageBuffer } },
    ],
  });

  const renderPassDescriptor = {
    label: 'our basic canvas renderPass',
    colorAttachments: [ // array of textures we will render to
      {
        // view: <- to be filled out when we render
        clearValue: [0, 0, 0, 1],
        loadOp: 'clear',
        storeOp: 'store',
      },
    ],
  };

  // Values for the global attributes that will need to be set every frame
  const globalAttributesValues = new Float32Array(globalAttributesBufferSize / 4);
  function render(looptime: number) {
    var lt = looptime;
    canvas.width = Math.max(1, device.limits.maxTextureDimension2D);
    canvas.height = Math.max(1, device.limits.maxTextureDimension2D);

    // Simulation Code:
    // swap the state buffers
    const currentStateValues = lt == 1 ? stateValues_0 : stateValues_1;
    const nextStateValues = lt == 1 ? stateValues_1 : stateValues_0;
    const stateValues: Int32Array = simulation(currentStateValues, nextStateValues, hexGridDimensions);

    // Get the current texture from the canvas context and
    // set it as the texture to render to.
    renderPassDescriptor.colorAttachments[0].view =
      context.getCurrentTexture().createView();

    // make a command encoder to start encoding commands
    const encoder = device.createCommandEncoder({ label: 'our simulation renderer encoder' });

    // make a render pass encoder to encode render specific commands
    const renderPass = encoder.beginRenderPass(renderPassDescriptor);
    renderPass.setPipeline(render_pipeline);

    // Set the uniform values in our JavaScript side Float32Array
    const aspect = canvas.width / canvas.height;

    const scale = 1.0;
    globalAttributesValues.set([scale / aspect, scale, hexGridDimensions[0], hexGridDimensions[1]], 0);
    device.queue.writeBuffer(globalAttributesBuffer, 0, globalAttributesValues);

    device.queue.writeBuffer(stateBuffer_0, 0, stateValues);

    renderPass.setBindGroup(0, renderBindGroup_0);
    renderPass.draw(numVertices, hexGridDimensions[0] * hexGridDimensions[1]);  // call our vertex shader for each vertex for each instance
    renderPass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
    lt = 1 - lt;
    setTimeout(() => {
      render(lt)
    }, 50);
  }
  render(1);
}
main();


// A random number between [min and max)
// With 1 argument it will be [0 to min)
// With no arguments it will be [0 to 1)
const rand = (min, max) => {
  if (min === undefined) {
    min = 0;
    max = 1;
  } else if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + Math.random() * (max - min);
};

// Create the vertices for a triangulized hexagon
function createHexagonVertices({
  hexSize = 0.1,
  center = { x: 0, y: 0 },
} = {}) {

  // 6 triangles per hexagon, 3 verts per tri, 2 values (xy) each.
  const numVertices = 6 * 3;
  const vertexData = new Float32Array(numVertices * 2);

  // 6 corners of the hexagon, each with an x and y.
  const corners = new Float32Array(6 * 2);

  for (let i = 0; i < 6; i++) {
    const corner_index = i * 2;
    const angle = 2.0 * Math.PI * ((i + 0.5) / 6); // Pointy top hexagons
    corners[corner_index] = hexSize * Math.cos(angle)
    corners[corner_index + 1] = hexSize * Math.sin(angle);
  }

  // Loop through all 6 triangles:
  for (let i = 0; i < 6; i++) {
    const vertexIndex = i * 6;
    const corner_index = i * 2;
    vertexData[vertexIndex + 0] = center.x;
    vertexData[vertexIndex + 1] = center.y;
    vertexData[vertexIndex + 2] = center.x + corners[corner_index];
    vertexData[vertexIndex + 3] = center.y + corners[corner_index + 1];
    vertexData[vertexIndex + 4] = center.x + corners[(corner_index + 2) % 12];
    vertexData[vertexIndex + 5] = center.y + corners[(corner_index + 3) % 12];
  }

  return {
    vertexData,
    numVertices,
  };
};
  
  
  
  // const hexRing(radius: number): Hex[] {
  //     const results: Hex[] = [];
  //     let hex = this.add(Hex.multiply(hexDirections[4], radius));
  //     for (let i = 0; i < 6; i++) {
  //         for (let j = 0; j < radius; j++) {
  //             results.push(hex);
  //             hex = hex.hexNeighbor(i);
  //         }
  //     }
  //     return results;
  // };
  
  // const hexSpiral(radius: number, include_center: boolean): Hex[] {
  //     const results: Hex[] = include_center ? [this] : [];
  //     for (let k = 1; k <= radius; k++) {
  //         results.push(...this.hexRing(k));
  //     }
  //     return results;
  // };
  