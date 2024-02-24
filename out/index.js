async function a(){const C=[256,256],k=1/Math.max(C[0],C[1]),w=await(await navigator.gpu?.requestAdapter())?.requestDevice();if(!w){fail("need a browser that supports WebGPU");return}else console.log("WebGPU is supported");const M=document.querySelector("canvas"),E=M.getContext("webgpu"),F=navigator.gpu.getPreferredCanvasFormat();E.configure({device:w,format:F});const _=await fetch("./shaders/hexgrid3d_vertex.wgsl").then((q)=>q.text()),B=await fetch("./shaders/hexgrid3d_fragment.wgsl").then((q)=>q.text()),D=await fetch("./shaders/hexgrid3d_compute.wgsl").then((q)=>q.text()),S=w.createShaderModule({label:"HexGrid3D vertex shader",code:_}),h=w.createShaderModule({label:"HexGrid3D fragment shader",code:B}),p=w.createShaderModule({label:"HexGrid3D compute module",code:D}),O=8,U=16,v=16,I=C[0]*C[1]*O,W=C[0]*C[1]*U,P=v,X=w.createBuffer({label:"Hex attributes storage buffer for objects",size:I,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),R=w.createBuffer({label:"flip colors storage buffer for objects",size:W,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),Y=w.createBuffer({label:"flop colors storage buffer for objects",size:W,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),Q=w.createBuffer({label:"global attributes uniform",size:P,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),s=0,n=2;{const q=new Float32Array(I/4);for(let j=0;j<C[0]*C[1];++j){const K=j*(O/4);let J=j%C[0],L=Math.floor(j/C[0]);L%2==1||(J+=0.5),q.set([J*Math.sqrt(3)*k,L*3/2*k],K)}w.queue.writeBuffer(X,0,q)}{const q=new Float32Array(W/4);for(let j=0;j<C[0]*C[1];++j){const K=j*(U/4);q.set([0,0,0,1],K);let J=Math.floor(j/C[0]),L=j%C[0];if(T(1)>0.999)q.set([T(0.3),T(0.3),T(0.3),1],K)}w.queue.writeBuffer(R,0,q)}const{vertexData:V,numVertices:u}=o({hexSize:k,center:{x:-1-k,y:-1+k}}),Z=w.createBuffer({label:"storage buffer vertices",size:V.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});w.queue.writeBuffer(Z,0,V);const $=w.createComputePipeline({label:"compute pipeline",layout:"auto",compute:{module:p,entryPoint:"main"}}),y=w.createRenderPipeline({label:"HexGrid3D pipeline",layout:"auto",vertex:{module:S,entryPoint:"vs"},fragment:{module:h,entryPoint:"fs",targets:[{format:F}]}}),l=w.createBindGroup({label:"flip bind group for objects",layout:y.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:X}},{binding:1,resource:{buffer:R}},{binding:2,resource:{buffer:Q}},{binding:3,resource:{buffer:Z}}]}),f=w.createBindGroup({label:"flop bind group for objects",layout:y.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:X}},{binding:1,resource:{buffer:Y}},{binding:2,resource:{buffer:Q}},{binding:3,resource:{buffer:Z}}]}),m=w.createBindGroup({layout:$.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:Q}},{binding:1,resource:{buffer:R}},{binding:2,resource:{buffer:Y}}]}),d=w.createBindGroup({layout:$.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:Q}},{binding:1,resource:{buffer:Y}},{binding:2,resource:{buffer:R}}]}),A={label:"our basic canvas renderPass",colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]},G=new Float32Array(P/4);function g(q){var j=q;M.width=Math.max(1,w.limits.maxTextureDimension2D),M.height=Math.max(1,w.limits.maxTextureDimension2D),A.colorAttachments[0].view=E.getCurrentTexture().createView();const K=w.createCommandEncoder({label:"our first triangle encoder"}),J=K.beginComputePass();J.setPipeline($),J.setBindGroup(0,q?m:d),J.dispatchWorkgroups(C[0]/4,C[1]/4),J.end();const L=K.beginRenderPass(A);L.setPipeline(y);const c=M.width/M.height,z=1;G.set([z/c,z,C[0],C[1]],0),w.queue.writeBuffer(Q,0,G),L.setBindGroup(0,q?l:f),L.draw(u,C[0]*C[1]),L.end();const x=K.finish();w.queue.submit([x]),j=1-j,setTimeout(()=>{g(j)},50)}g(1)}var o=function({hexSize:C=0.1,center:k={x:0,y:0}}={}){const H=new Float32Array(36),N=new Float32Array(12);for(let w=0;w<6;w++){const M=w*2,E=2*Math.PI*((w+0.5)/6);N[M]=C*Math.cos(E),N[M+1]=C*Math.sin(E)}for(let w=0;w<6;w++){const M=w*6,E=w*2;H[M+0]=k.x,H[M+1]=k.y,H[M+2]=k.x+N[E],H[M+3]=k.y+N[E+1],H[M+4]=k.x+N[(E+2)%12],H[M+5]=k.y+N[(E+3)%12]}return console.log(H),{vertexData:H,numVertices:18}};a();var T=(C,k)=>{if(C===void 0)C=0,k=1;else if(k===void 0)k=C,C=0;return C+Math.random()*(k-C)};
