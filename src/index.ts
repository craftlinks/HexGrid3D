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
        label: 'HexGrid3D shader',
        code: `

        struct Global {
            scale: vec2f,
            grid_width: f32,
            grid_height: f32,
        }
        
        struct HexAttributes {
            color: vec4f,
            offset: vec2f,
        };

        struct Vertex {
            position: vec2f,
        }

        struct VSOutput {
            @builtin(position) position: vec4f,
            @location(0) color: vec4f,
        }

        @group(0) @binding(0) var<storage, read> hexes: array<HexAttributes>;
        @group(0) @binding(1) var<uniform> global: Global;
        @group(0) @binding(2) var<storage, read> pos: array<Vertex>;

        @vertex fn vs(
            @builtin(vertex_index) vertexIndex : u32, // each time we call the vertex shader, this will be 0, 1, 2
            @builtin(instance_index) instanceIndex : u32 // each time we call the vertex shader, this will be 0, 1, ... (kNumObjects - 1)
        ) -> VSOutput {

            // let left:i32 = -1;
            // let up_left:i32 = i32(global.grid_width);
            // let up_right: i32 = i32(global.grid_width + 1);
            // let right:i32 = 1;
            // let down_right: i32 = -global.grid_width;
            // let down_left = -global.grid_width - 1;

            let hex = hexes[instanceIndex];
            
            
    
            var vsOut: VSOutput;
            vsOut.position = vec4f((pos[vertexIndex].position + 0.2) * global.scale + hex.offset * global.scale, 0.0, 1.0);
            vsOut.color = hex.color;
                let left_hex = hexes[instanceIndex - 1];
                let up_left_hex = hexes[i32(instanceIndex) + i32(global.grid_width)];
                let up_right_hex = hexes[i32(instanceIndex) + i32(global.grid_width + 1)];
                let right_hex = hexes[i32(instanceIndex) + 1];
                let down_right_hex = hexes[i32(instanceIndex) - i32(global.grid_width)];
                let down_left_hex = hexes[i32(instanceIndex) - i32(global.grid_width - 1)];
                let sum = left_hex.color.r + up_left_hex.color.r + up_right_hex.color.r + right_hex.color.r + down_right_hex.color.r + down_left_hex.color.r;
                if (sum > 3) {
                    vsOut.color = vec4f(hex.color.r - (0.1 * sum), 0.1,0.2, 1);
                }
                else {
                    vsOut.color = vec4f(hex.color.r + (0.1 * sum), 0.1, 0.3, 1);
                }
            return vsOut;
        }
    
        @fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
            return vsOut.color;
        }
        `,
    });

    const pipeline = device.createRenderPipeline({
        label: 'HexGrid3D pipeline',
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


    const hexGridDimensions = [10.0,10.0];
    const hexSize = 1.0/(Math.max(hexGridDimensions[0], hexGridDimensions[1])) ;
 
    const hexAttributeUnitSize =
        4 * 4 + // color is 4 32bit floats (4bytes each)
        2 * 4 + // offset is 2 32bit floats (4bytes each)
        2 * 4;  // padding is 2 32bit floats (4bytes each)

    const GlobalAttributesUnitSize =  
    2 * 4 +  // scale is 2 32bit floats (4bytes each)
    2 * 4;  // grid_width and grid_height are 2 32bit floats (4bytes each)
    // Padding required?

    const hexAttributesStorageBufferSize = hexGridDimensions[0] * hexGridDimensions[1] * hexAttributeUnitSize;
    const globalAttributesBufferSize = GlobalAttributesUnitSize;

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
    const kColorOffset = 0;
    const kOffsetOffset = 4;
    const kScaleOffset = 0;
    const kGridDimensionsOffset = 2;
    

    {
        const hexAttributesStorageValues = new Float32Array(hexAttributesStorageBufferSize / 4);
        for (let i = 0; i < hexGridDimensions[0] * hexGridDimensions[1] ; ++i) {
            const bufferOffset = i * (hexAttributeUnitSize / 4);
            let x = i % hexGridDimensions[0];
            let y = Math.floor(i / hexGridDimensions[0]);
            y % 2 == 1 ? x : x += 0.5; 
          // These are only set once so set them now
          hexAttributesStorageValues.set([rand(), 1], bufferOffset + kColorOffset);        // set the color
          hexAttributesStorageValues.set([x * Math.sqrt(3) * hexSize, y * 3/2 * hexSize], bufferOffset + kOffsetOffset);      // set the offset
        }
        device.queue.writeBuffer(hexAttributesStorageBuffer, 0, hexAttributesStorageValues);
    }

    const globalAttributesValues = new Float32Array(globalAttributesBufferSize / 4);

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


    const bindGroup = device.createBindGroup({
        label: 'bind group for objects',
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: hexAttributesStorageBuffer }},
            { binding: 1, resource: { buffer: globalAttributesBuffer }},
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
        
        const scale = 1.0;
        globalAttributesValues.set([scale / aspect, scale, hexGridDimensions[0], hexGridDimensions[1]], 0);
        device.queue.writeBuffer(globalAttributesBuffer, 0, globalAttributesValues);
   
        pass.setBindGroup(0, bindGroup);
        pass.draw(numVertices, hexGridDimensions[0] * hexGridDimensions[1]);  // call our vertex shader for each vertex for each instance

        
        pass.end();
    
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);

        requestAnimationFrame(render);
    }
    render();
    
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
  center = { x: 0, y: 0 },
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
            vertexData[vertexIndex + 0] = center.x;
            vertexData[vertexIndex + 1] = center.y;
            vertexData[vertexIndex + 2] = center.x + corners[corner_index];
            vertexData[vertexIndex + 3] = center.y + corners[corner_index + 1];
            vertexData[vertexIndex + 4] = center.x + corners[(corner_index + 2) % 12];
            vertexData[vertexIndex + 5] = center.y + corners[(corner_index + 3) % 12];
        }

        console.log(vertexData)

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
  