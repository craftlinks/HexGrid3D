async function x(){const q=[64,64],w=1/Math.max(q[0],q[1]),j=await(await navigator.gpu?.requestAdapter())?.requestDevice();if(!j){fail("need a browser that supports WebGPU");return}else console.log("WebGPU is supported");const k=document.querySelector("canvas"),C=k.getContext("webgpu"),y=navigator.gpu.getPreferredCanvasFormat();C.configure({device:j,format:y});const b=await fetch("./shaders/hexgrid3d_vertex.wgsl").then((L)=>L.text()),_=await fetch("./shaders/hexgrid3d_fragment.wgsl").then((L)=>L.text()),B=await fetch("./shaders/hexgrid3d_compute.wgsl").then((L)=>L.text()),S=j.createShaderModule({label:"HexGrid3D vertex shader",code:b}),D=j.createShaderModule({label:"HexGrid3D fragment shader",code:_}),p=j.createShaderModule({label:"HexGrid3D compute module",code:B}),F=8,U=16,h=16,O=q[0]*q[1]*F,R=q[0]*q[1]*U,I=h,T=j.createBuffer({label:"Hex attributes storage buffer for objects",size:O,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),Q=j.createBuffer({label:"flip colors storage buffer for objects",size:R,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),X=j.createBuffer({label:"flop colors storage buffer for objects",size:R,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),N=j.createBuffer({label:"global attributes uniform",size:I,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),o=0,n=2;{const L=new Float32Array(O/4);for(let W=0;W<q[0]*q[1];++W){const J=W*(F/4);let H=W%q[0],K=Math.floor(W/q[0]);K%2==1||(H+=0.5),L.set([H*Math.sqrt(3)*w,K*3/2*w],J)}j.queue.writeBuffer(T,0,L)}{const L=new Float32Array(R/4);for(let W=0;W<q[0]*q[1];++W){const J=W*(U/4);L.set([0,0,0,1],J);let H=Math.floor(W/q[0]),K=W%q[0];if(W==q[0]*q[1]/2+q[0]/2)L.set([1,1,1,1],J)}j.queue.writeBuffer(Q,0,L)}const{vertexData:P,numVertices:v}=c({hexSize:w,center:{x:-1-w,y:-1+w}}),Y=j.createBuffer({label:"storage buffer vertices",size:P.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});j.queue.writeBuffer(Y,0,P);const Z=j.createComputePipeline({label:"compute pipeline",layout:"auto",compute:{module:p,entryPoint:"main"}}),$=j.createRenderPipeline({label:"HexGrid3D pipeline",layout:"auto",vertex:{module:S,entryPoint:"vs"},fragment:{module:D,entryPoint:"fs",targets:[{format:y}]}}),l=j.createBindGroup({label:"flip bind group for objects",layout:$.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:T}},{binding:1,resource:{buffer:Q}},{binding:2,resource:{buffer:N}},{binding:3,resource:{buffer:Y}}]}),f=j.createBindGroup({label:"flop bind group for objects",layout:$.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:T}},{binding:1,resource:{buffer:X}},{binding:2,resource:{buffer:N}},{binding:3,resource:{buffer:Y}}]}),m=j.createBindGroup({layout:Z.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:N}},{binding:1,resource:{buffer:Q}},{binding:2,resource:{buffer:X}}]}),u=j.createBindGroup({layout:Z.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:N}},{binding:1,resource:{buffer:X}},{binding:2,resource:{buffer:Q}}]}),V={label:"our basic canvas renderPass",colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]},A=new Float32Array(I/4);function z(L){var W=L;k.width=Math.max(1,j.limits.maxTextureDimension2D),k.height=Math.max(1,j.limits.maxTextureDimension2D),V.colorAttachments[0].view=C.getCurrentTexture().createView();const J=j.createCommandEncoder({label:"our first triangle encoder"}),H=J.beginComputePass();H.setPipeline(Z),H.setBindGroup(0,L?m:u),H.dispatchWorkgroups(q[0]/4,q[1]/4),H.end();const K=J.beginRenderPass(V);K.setPipeline($);const d=k.width/k.height,g=1;A.set([g/d,g,q[0],q[1]],0),j.queue.writeBuffer(N,0,A),K.setBindGroup(0,L?l:f),K.draw(v,q[0]*q[1]),K.end();const a=J.finish();j.queue.submit([a]),W=1-W,setTimeout(()=>{z(W)},100)}z(1)}var c=function({hexSize:q=0.1,center:w={x:0,y:0}}={}){const E=new Float32Array(36),M=new Float32Array(12);for(let j=0;j<6;j++){const k=j*2,C=2*Math.PI*((j+0.5)/6);M[k]=q*Math.cos(C),M[k+1]=q*Math.sin(C)}for(let j=0;j<6;j++){const k=j*6,C=j*2;E[k+0]=w.x,E[k+1]=w.y,E[k+2]=w.x+M[C],E[k+3]=w.y+M[C+1],E[k+4]=w.x+M[(C+2)%12],E[k+5]=w.y+M[(C+3)%12]}return console.log(E),{vertexData:E,numVertices:18}};x();