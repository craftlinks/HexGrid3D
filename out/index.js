async function B(){const w=await(await navigator.gpu?.requestAdapter())?.requestDevice();if(!w){fail("need a browser that supports WebGPU");return}else console.log("WebGPU is supported");const W=document.querySelector("canvas"),J=W.getContext("webgpu"),L=navigator.gpu.getPreferredCanvasFormat();J.configure({device:w,format:L});const q=w.createShaderModule({label:"HexGrid3D shader",code:`

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
        `}),E=w.createRenderPipeline({label:"HexGrid3D pipeline",layout:"auto",vertex:{module:q,entryPoint:"vs"},fragment:{module:q,entryPoint:"fs",targets:[{format:L}]}}),T=[10,10],X=1/Math.max(T[0],T[1]),Z=32,y=16,$=T[0]*T[1]*Z,C=y,F=w.createBuffer({label:"Hex attributes storage buffer for objects",size:$,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),H=w.createBuffer({label:"global attributes uniform",size:C,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),O=0,I=4,z=0,A=2;{const M=new Float32Array($/4);for(let j=0;j<T[0]*T[1];++j){const Q=j*(Z/4);let N=j%T[0],R=Math.floor(j/T[0]);R%2==1||(N+=0.5),M.set([G(),1],Q+O),M.set([N*Math.sqrt(3)*X,R*3/2*X],Q+I)}w.queue.writeBuffer(F,0,M)}const k=new Float32Array(C/4),{vertexData:P,numVertices:V}=g({hexSize:X,center:{x:-1-X,y:-1+X}}),_=w.createBuffer({label:"storage buffer vertices",size:P.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});w.queue.writeBuffer(_,0,P);const p=w.createBindGroup({label:"bind group for objects",layout:E.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:F}},{binding:1,resource:{buffer:H}},{binding:2,resource:{buffer:_}}]}),U={label:"our basic canvas renderPass",colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]};function Y(){U.colorAttachments[0].view=J.getCurrentTexture().createView();const M=w.createCommandEncoder({label:"our first triangle encoder"}),j=M.beginRenderPass(U);j.setPipeline(E);const Q=W.width/W.height,N=1;k.set([N/Q,N,T[0],T[1]],0),w.queue.writeBuffer(H,0,k),j.setBindGroup(0,p),j.draw(V,T[0]*T[1]),j.end();const R=M.finish();w.queue.submit([R]),requestAnimationFrame(Y)}Y(),new ResizeObserver((M)=>{for(let j of M){const Q=j.target,N=j.contentBoxSize[0].inlineSize,R=j.contentBoxSize[0].blockSize;Q.width=Math.max(1,Math.min(N,w.limits.maxTextureDimension2D)),Q.height=Math.max(1,Math.min(R,w.limits.maxTextureDimension2D)),Y()}}).observe(W)}var g=function({hexSize:K=0.1,center:w={x:0,y:0}}={}){const J=new Float32Array(36),L=new Float32Array(12);for(let q=0;q<6;q++){const E=q*2,T=2*Math.PI*((q+0.5)/6);L[E]=K*Math.cos(T),L[E+1]=K*Math.sin(T)}for(let q=0;q<6;q++){const E=q*6,T=q*2;J[E+0]=w.x,J[E+1]=w.y,J[E+2]=w.x+L[T],J[E+3]=w.y+L[T+1],J[E+4]=w.x+L[(T+2)%12],J[E+5]=w.y+L[(T+3)%12]}return console.log(J),{vertexData:J,numVertices:18}};B();var G=(K,w)=>{if(K===void 0)K=0,w=1;else if(w===void 0)w=K,K=0;return K+Math.random()*(w-K)};
