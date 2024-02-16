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
        label: 'our hardcoded checker triangle shaders',
        code: `
        
        @vertex fn vs(
            @builtin(vertex_index) vertexIndex : u32 // each time we call the vertex shader, this will be 0, 1, 2
        ) -> @builtin(position) vec4f {
                let pos = array(
                vec2f( 0.0,  0.5),  // top center
                vec2f(-0.5, -0.5),  // bottom left
                vec2f( 0.5, -0.5)   // bottom right
            );

            return vec4f(pos[vertexIndex], 0.0, 1.0);
        }
    
        @fragment fn fs(@builtin(position) position: vec4f) -> @location(0) vec4f {
            let red = vec4f(1, 0, 0, 1);
            let cyan = vec4f(0, 1, 1, 1);
    
            let grid = vec2u(position.xy) / 16; // based on the pixel coordinates of the canvas, not the triangle
            let checker = (grid.x + grid.y) % 2 == 1;
    
            return select(red, cyan, checker);
        }
        `,
    });

    const pipeline = device.createRenderPipeline({
        label: 'our hardcoded checker triangle pipeline',
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
        pass.draw(3);  // call our vertex shader 3 times, meaning we increase vertexIndex from 0 to 1 to 2 and draw a triangle
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