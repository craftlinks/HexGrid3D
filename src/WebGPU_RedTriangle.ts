async function main() {
    
    const aspectRatio = 16 / 9;
    
    window.addEventListener('load', function() {
        var canvas = document.querySelector('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth / aspectRatio;
    });

    window.addEventListener('resize', function() {
        var canvas = document.querySelector('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth * aspectRatio;
    });
    
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
        label: 'our hardcoded red triangle shaders',
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
    
        @fragment fn fs() -> @location(0) vec4f {
            return vec4f(1.0, 0.0, 0.0, 1.0);
        }
        `,
    });

    const pipeline = device.createRenderPipeline({
        label: 'our hardcoded red triangle pipeline',
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
            clearValue: [1, 1, 1, 1],
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