async function x(){const k=[100,100],M=1/Math.max(k[0],k[1]),w=await(await navigator.gpu?.requestAdapter())?.requestDevice();if(!w){fail("need a browser that supports WebGPU");return}else console.log("WebGPU is supported");const j=document.querySelector("canvas"),q=j.getContext("webgpu"),E=navigator.gpu.getPreferredCanvasFormat();q.configure({device:w,format:E});const J=await fetch("./shaders/hexgrid3d_vertex.wgsl").then((H)=>H.text()),B=await fetch("./shaders/hexgrid3d_fragment.wgsl").then((H)=>H.text()),G=await fetch("./shaders/hexgrid3d_compute.wgsl").then((H)=>H.text()),_=w.createShaderModule({label:"HexGrid3D vertex shader",code:J}),S=w.createShaderModule({label:"HexGrid3D fragment shader",code:B}),p=w.createShaderModule({label:"HexGrid3D compute module",code:G}),Y=8,D=16,l=16,Z=4,$=k[0]*k[1]*Y,h=k[0]*k[1]*D,y=l,R=k[0]*k[1]*Z,F=w.createBuffer({label:"Hex attributes storage buffer for objects",size:$,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),T=w.createBuffer({label:"flip colors storage buffer for objects",size:h,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),Q=w.createBuffer({label:"global attributes uniform",size:y,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),W=w.createBuffer({label:"state buffer 0",size:R,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),O=w.createBuffer({label:"state buffer 1",size:R,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),a=0,s=2;{const H=new Float32Array($/4);for(let C=0;C<k[0]*k[1];++C){const L=C*(Y/4);let K=C%k[0],N=Math.floor(C/k[0]);N%2==1||(K+=0.5),H.set([K*Math.sqrt(3)*M,N*3/2*M],L)}w.queue.writeBuffer(F,0,H)}{const H=new Uint32Array(R/4);for(let C=0;C<k[0]*k[1];++C){const L=C*(Z/4);if(C==k[0]*k[1]/2+k[0]/2)H.set([128000],L)}w.queue.writeBuffer(W,0,H)}const{vertexData:U,numVertices:v}=o({hexSize:M,center:{x:-1-M,y:-1+M}}),I=w.createBuffer({label:"storage buffer vertices",size:U.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});w.queue.writeBuffer(I,0,U);const X=w.createComputePipeline({label:"compute pipeline",layout:"auto",compute:{module:p,entryPoint:"main"}}),V=w.createRenderPipeline({label:"HexGrid3D pipeline",layout:"auto",vertex:{module:_,entryPoint:"vs"},fragment:{module:S,entryPoint:"fs",targets:[{format:E}]}}),f=w.createBindGroup({label:"flip bind group for objects",layout:V.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:F}},{binding:1,resource:{buffer:T}},{binding:2,resource:{buffer:Q}},{binding:3,resource:{buffer:I}}]}),m=w.createBindGroup({layout:X.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:Q}},{binding:1,resource:{buffer:T}},{binding:2,resource:{buffer:W}},{binding:3,resource:{buffer:O}}]}),u=w.createBindGroup({layout:X.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:Q}},{binding:1,resource:{buffer:T}},{binding:2,resource:{buffer:O}},{binding:3,resource:{buffer:W}}]}),P={label:"our basic canvas renderPass",colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]},A=new Float32Array(y/4);function g(H){var C=H;j.width=Math.max(1,w.limits.maxTextureDimension2D),j.height=Math.max(1,w.limits.maxTextureDimension2D),P.colorAttachments[0].view=q.getCurrentTexture().createView();const L=w.createCommandEncoder({label:"our first triangle encoder"}),K=L.beginComputePass();K.setPipeline(X),K.setBindGroup(0,C?m:u),K.dispatchWorkgroups(k[0],k[1]),K.end();const N=L.beginRenderPass(P);N.setPipeline(V);const d=j.width/j.height,z=1;A.set([z/d,z,k[0],k[1]],0),w.queue.writeBuffer(Q,0,A),N.setBindGroup(0,f),N.draw(v,k[0]*k[1]),N.end();const c=L.finish();w.queue.submit([c]),C=1-C,setTimeout(()=>{g(C)},50)}g(1)}var o=function({hexSize:k=0.1,center:M={x:0,y:0}}={}){const w=new Float32Array(36),j=new Float32Array(12);for(let q=0;q<6;q++){const E=q*2,J=2*Math.PI*((q+0.5)/6);j[E]=k*Math.cos(J),j[E+1]=k*Math.sin(J)}for(let q=0;q<6;q++){const E=q*6,J=q*2;w[E+0]=M.x,w[E+1]=M.y,w[E+2]=M.x+j[J],w[E+3]=M.y+j[J+1],w[E+4]=M.x+j[(J+2)%12],w[E+5]=M.y+j[(J+3)%12]}return console.log(w),{vertexData:w,numVertices:18}};x();