async function x(){const q=[10,10],C=1/Math.max(q[0],q[1]),j=await(await navigator.gpu?.requestAdapter())?.requestDevice();if(!j){fail("need a browser that supports WebGPU");return}else console.log("WebGPU is supported");const w=document.querySelector("canvas"),E=w.getContext("webgpu"),y=navigator.gpu.getPreferredCanvasFormat();E.configure({device:j,format:y});const _=await fetch("./shaders/hexgrid3d_vertex.wgsl").then((L)=>L.text()),b=await fetch("./shaders/hexgrid3d_fragment.wgsl").then((L)=>L.text()),B=await fetch("./shaders/hexgrid3d_compute.wgsl").then((L)=>L.text()),S=j.createShaderModule({label:"HexGrid3D vertex shader",code:_}),D=j.createShaderModule({label:"HexGrid3D fragment shader",code:b}),p=j.createShaderModule({label:"HexGrid3D compute module",code:B}),F=8,U=16,h=16,O=q[0]*q[1]*F,T=q[0]*q[1]*U,I=h,W=j.createBuffer({label:"Hex attributes storage buffer for objects",size:O,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),R=j.createBuffer({label:"flip colors storage buffer for objects",size:T,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),X=j.createBuffer({label:"flop colors storage buffer for objects",size:T,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),Q=j.createBuffer({label:"global attributes uniform",size:I,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),o=0,n=2;{const L=new Float32Array(O/4);for(let k=0;k<q[0]*q[1];++k){const K=k*(F/4);let J=k%q[0],M=Math.floor(k/q[0]);M%2==1||(J+=0.5),L.set([J*Math.sqrt(3)*C,M*3/2*C],K)}j.queue.writeBuffer(W,0,L)}{const L=new Float32Array(T/4);for(let k=0;k<q[0]*q[1];++k){const K=k*(U/4);L.set([0,0,0,1],K);let J=Math.floor(k/q[0]),M=k%q[0];if(k==q[0]*q[1]/2+q[0]/2)L.set([1,1,1,1],K)}j.queue.writeBuffer(R,0,L)}const{vertexData:P,numVertices:v}=c({hexSize:C,center:{x:-1-C,y:-1+C}}),Y=j.createBuffer({label:"storage buffer vertices",size:P.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});j.queue.writeBuffer(Y,0,P);const Z=j.createComputePipeline({label:"compute pipeline",layout:"auto",compute:{module:p,entryPoint:"main"}}),$=j.createRenderPipeline({label:"HexGrid3D pipeline",layout:"auto",vertex:{module:S,entryPoint:"vs"},fragment:{module:D,entryPoint:"fs",targets:[{format:y}]}}),l=j.createBindGroup({label:"flip bind group for objects",layout:$.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:W}},{binding:1,resource:{buffer:R}},{binding:2,resource:{buffer:Q}},{binding:3,resource:{buffer:Y}}]}),f=j.createBindGroup({label:"flop bind group for objects",layout:$.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:W}},{binding:1,resource:{buffer:X}},{binding:2,resource:{buffer:Q}},{binding:3,resource:{buffer:Y}}]}),m=j.createBindGroup({layout:Z.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:Q}},{binding:1,resource:{buffer:R}},{binding:2,resource:{buffer:X}}]}),u=j.createBindGroup({layout:Z.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:Q}},{binding:1,resource:{buffer:X}},{binding:2,resource:{buffer:R}}]}),V={label:"our basic canvas renderPass",colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]},A=new Float32Array(I/4);function z(L){var k=L;w.width=Math.max(1,j.limits.maxTextureDimension2D),w.height=Math.max(1,j.limits.maxTextureDimension2D),V.colorAttachments[0].view=E.getCurrentTexture().createView();const K=j.createCommandEncoder({label:"our first triangle encoder"}),J=K.beginComputePass();J.setPipeline(Z),J.setBindGroup(0,L?m:u),J.dispatchWorkgroups(q[0]/4,q[1]/4),J.end();const M=K.beginRenderPass(V);M.setPipeline($);const d=w.width/w.height,g=1;A.set([g/d,g,q[0],q[1]],0),j.queue.writeBuffer(Q,0,A),M.setBindGroup(0,L?l:f),M.draw(v,q[0]*q[1]),M.end();const a=K.finish();j.queue.submit([a]),k=1-k,setTimeout(()=>{z(k)},1000)}z(1)}var c=function({hexSize:q=0.1,center:C={x:0,y:0}}={}){const H=new Float32Array(36),N=new Float32Array(12);for(let j=0;j<6;j++){const w=j*2,E=2*Math.PI*((j+0.5)/6);N[w]=q*Math.cos(E),N[w+1]=q*Math.sin(E)}for(let j=0;j<6;j++){const w=j*6,E=j*2;H[w+0]=C.x,H[w+1]=C.y,H[w+2]=C.x+N[E],H[w+3]=C.y+N[E+1],H[w+4]=C.x+N[(E+2)%12],H[w+5]=C.y+N[(E+3)%12]}return console.log(H),{vertexData:H,numVertices:18}};x();