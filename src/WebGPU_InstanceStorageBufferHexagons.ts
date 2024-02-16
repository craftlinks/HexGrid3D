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

    // Get a WebGPU context from the canvas and configure it
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('webgpu');
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format: presentationFormat,
    });

    const module = device.createShaderModule({
        label: 'triangle shaders with uniforms',
        code: `

        struct OurStruct {
            color: vec4f,
            offset: vec2f,
        };

        struct OtherStruct{
            scale: vec2f,
        };

        struct Vertex {
            position: vec2f,
        }

        struct VSOutput {
            @builtin(position) position: vec4f,
            @location(0) color: vec4f,
        }

        @group(0) @binding(0) var<storage, read> ourStructs: array<OurStruct>;
        @group(0) @binding(1) var<storage, read> otherStructs: array<OtherStruct>;
        @group(0) @binding(2) var<storage, read> pos: array<Vertex>;

        @vertex fn vs(
            @builtin(vertex_index) vertexIndex : u32, // each time we call the vertex shader, this will be 0, 1, 2
            @builtin(instance_index) instanceIndex : u32 // each time we call the vertex shader, this will be 0, 1, ... (kNumObjects - 1)
        ) -> VSOutput {
            

            let otherStruct = otherStructs[instanceIndex];
            let ourStruct = ourStructs[instanceIndex];
    
            var vsOut: VSOutput;
            vsOut.position = vec4f(pos[vertexIndex].position * otherStruct.scale + ourStruct.offset, 0.0, 1.0);
            vsOut.color = ourStruct.color;
            return vsOut;
        }
    
        @fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
            return vsOut.color;
        }
        `,
    });

    const pipeline = device.createRenderPipeline({
        label: 'instanced storage buffer pipeline',
        layout: 'auto',
        vertex: {
        module,
        entryPoint: 'vs',
        },
        fragment: {
        module,
        entryPoint: 'fs',
        targets: [{ format: presentationFormat }],
        },
    });


    const kNumObjects = 100;
    const objectInfos = [];
 
    const staticUnitSize =
        4 * 4 + // color is 4 32bit floats (4bytes each)
        2 * 4 + // offset is 2 32bit floats (4bytes each)
        2 * 4;  // padding is 2 32bit floats (4bytes each)

    const changingUnitSize =  2 * 4;  // scale is 2 32bit floats (4bytes each)

    const staticStorageBufferSize = kNumObjects * staticUnitSize;
    const changingStorageBufferSize = kNumObjects * changingUnitSize;

    const staticStorageBuffer = device.createBuffer({
        label: `static storage buffer for objects`,
        size: staticStorageBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    const changingStorageBuffer = device.createBuffer({
        label: `changing storage buffer for objects`,
        size: changingStorageBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    // offsets to the various uniform values in float32 indices
    const kColorOffset = 0;
    const kOffsetOffset = 4;

    const kScaleOffset = 0;

    {
        const staticStorageValues = new Float32Array(staticStorageBufferSize / 4);
        for (let i = 0; i < kNumObjects; ++i) {
          const staticOffset = i * (staticUnitSize / 4);
     
          // These are only set once so set them now
          staticStorageValues.set([rand(), rand(), rand(), 1], staticOffset + kColorOffset);        // set the color
          staticStorageValues.set([rand(-0.9, 0.9), rand(-0.9, 0.9)], staticOffset + kOffsetOffset);      // set the offset
     
          objectInfos.push({
            scale: rand(0.2, 0.5),
          });
        }
        device.queue.writeBuffer(staticStorageBuffer, 0, staticStorageValues);
    }

    // a typed array we can use to update the changingStorageBuffer
    const storageValues = new Float32Array(changingStorageBufferSize / 4);

    // setup a storage buffer with vertex data
    const { vertexData, numVertices } = createHexagonVertices({
        hexSize: 0.1,
    });

    const vertexStorageBuffer = device.createBuffer({
        label: 'storage buffer vertices',
        size: vertexData.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexStorageBuffer, 0, vertexData);



    const bindGroup = device.createBindGroup({
        label: 'bind group for objects',
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: staticStorageBuffer }},
          { binding: 1, resource: { buffer: changingStorageBuffer }},
          { binding: 2, resource: { buffer: vertexStorageBuffer }},
        ],
    });

    const renderPassDescriptor = {
        label: 'our basic canvas renderPass',
        colorAttachments: [ // array of textures we will render to
        {
            // view: <- to be filled out when we render
            clearValue: [0, 0, 0 , 1],
            loadOp: 'clear',
            storeOp: 'store',
        },
        ],
    };
    
    function render() {
            
        // Get the current texture from the canvas context and
        // set it as the texture to render to.
        renderPassDescriptor.colorAttachments[0].view =
            context.getCurrentTexture().createView();
    
        // make a command encoder to start encoding commands
        const encoder = device.createCommandEncoder({ label: 'our first triangle encoder' });
    
        // make a render pass encoder to encode render specific commands
        const pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(pipeline);

        // Set the uniform values in our JavaScript side Float32Array
        const aspect = canvas.width / canvas.height;
        
        // set the scales for each object
        objectInfos.forEach(({scale}, ndx) => {
            const offset = ndx * (changingUnitSize / 4);
            storageValues.set([scale / aspect, scale], offset + kScaleOffset); // set the scale
        });

        // upload all scales at once
        device.queue.writeBuffer(changingStorageBuffer, 0, storageValues);
   
        pass.setBindGroup(0, bindGroup);
        pass.draw(numVertices, kNumObjects);  // call our vertex shader for each vertex for each instance

        
        pass.end();
    
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }
    
    //
    // Create a ResizeObserver and give it a function to call whenever the elements you’ve asked it to observe change their size. 
    // You then tell it which elements to observe.
    //
    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          const canvas = entry.target;
          const width = entry.contentBoxSize[0].inlineSize;
          const height = entry.contentBoxSize[0].blockSize;
          canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
          canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
          // re-render
          render();
        }
      });
      observer.observe(canvas);
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

  function createHexagonVertices({
  hexSize = 0.1,
    } = {}) {  

        // 6 triangles per hexagon, 3 verts per tri, 2 values (xy) each.
        const numVertices = 6 * 3 ;
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
            vertexData[vertexIndex + 0] = 0.0;
            vertexData[vertexIndex + 1] = 0.0;
            vertexData[vertexIndex + 2] = corners[corner_index];
            vertexData[vertexIndex + 3] = corners[corner_index + 1];
            vertexData[vertexIndex + 4] = corners[(corner_index + 2) % 12];
            vertexData[vertexIndex + 5] = corners[(corner_index + 3) % 12];
        }

        console.log(vertexData)

        return {
            vertexData,
            numVertices,
        };
  };

  function createCircleVertices({
    radius = 1,
    numSubdivisions = 48,
    innerRadius = 0,
    startAngle = 0,
    endAngle = Math.PI * 2,
  } = {}) {
    // 2 triangles per subdivision, 3 verts per tri, 2 values (xy) each.
    const numVertices = numSubdivisions * 3 * 2;
    const vertexData = new Float32Array(numSubdivisions * 2 * 3 * 2);
   
    let offset = 0;
    const addVertex = (x, y) => {
      vertexData[offset++] = x;
      vertexData[offset++] = y;
    };
   
    // 2 triangles per subdivision
    //
    // 0--1 4
    // | / /|
    // |/ / |
    // 2 3--5
    for (let i = 0; i < numSubdivisions; ++i) {
      const angle1 = startAngle + (i + 0) * (endAngle - startAngle) / numSubdivisions;
      const angle2 = startAngle + (i + 1) * (endAngle - startAngle) / numSubdivisions;
   
      const c1 = Math.cos(angle1);
      const s1 = Math.sin(angle1);
      const c2 = Math.cos(angle2);
      const s2 = Math.sin(angle2);
   
      // first triangle
      addVertex(c1 * radius, s1 * radius);
      addVertex(c2 * radius, s2 * radius);
      addVertex(c1 * innerRadius, s1 * innerRadius);
   
      // second triangle
      addVertex(c1 * innerRadius, s1 * innerRadius);
      addVertex(c2 * radius, s2 * radius);
      addVertex(c2 * innerRadius, s2 * innerRadius);
    }
   
    return {
      vertexData,
      numVertices,
    };
  }