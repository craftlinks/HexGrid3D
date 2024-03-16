var E={mu_k:4,sigma_k:1,w_k:0.022,mu_g:0.6,sigma_g:0.15,c_rep:1,dt:0.02,point_n:6400};async function S(){const q=await(await navigator.gpu?.requestAdapter())?.requestDevice();if(!q){fail("need a browser that supports WebGPU");return}else console.log("WebGPU is supported");var H=document.querySelector("canvas");const D=await fetch("./shaders/lenia_compute.wgsl").then((b)=>b.text()),V=q.createBuffer({label:"Rval buffer",size:E.point_n*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),W=q.createBuffer({label:"Uval buffer",size:E.point_n*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),X=q.createBuffer({label:"Rgrad buffer",size:E.point_n*2*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),Y=q.createBuffer({label:"Ugrad buffer",size:E.point_n*2*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),J=q.createBuffer({label:"Position buffer",size:E.point_n*2*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),k=q.createBuffer({label:"Position buffer result",size:E.point_n*2*4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});{const b=new Float32Array(E.point_n*2);for(let I=0;I<E.point_n;++I)b[I*2]=(Math.random()-0.5)*12,b[I*2+1]=(Math.random()-0.5)*12;q.queue.writeBuffer(J,0,b)}const K=q.createShaderModule({label:"Lenia Compute Shader",code:D}),$=q.createComputePipeline({label:"reset pipeline",layout:"auto",compute:{module:K,entryPoint:"reset_buffers"}}),N=q.createComputePipeline({label:"compute fields pipeline",layout:"auto",compute:{module:K,entryPoint:"compute_fields"}}),y=q.createComputePipeline({label:"update positions pipeline",layout:"auto",compute:{module:K,entryPoint:"update_positions"}}),M=q.createBindGroup({layout:N.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:V}},{binding:1,resource:{buffer:W}},{binding:2,resource:{buffer:X}},{binding:3,resource:{buffer:Y}},{binding:4,resource:{buffer:J}}]});async function z(){const b=q.createCommandEncoder({label:"our command encoder"}),I=b.beginComputePass();I.setPipeline($),I.setBindGroup(0,M),I.dispatchWorkgroups(E.point_n/64),I.end();const j=b.beginComputePass();j.setPipeline(N),j.setBindGroup(0,M),j.dispatchWorkgroups(E.point_n/64),j.end();const L=b.beginComputePass();L.setPipeline(y),L.setBindGroup(0,M),L.dispatchWorkgroups(E.point_n/64),L.end(),b.copyBufferToBuffer(J,0,k,0,k.size);const A=b.finish();q.queue.submit([A])}async function U(b,I=100,j=5){for(let T=0;T<j;++T)await z();await k.mapAsync(GPUMapMode.READ);const L=new Float32Array(k.getMappedRange()),{width:A,height:O}=b.canvas;b.resetTransform(),b.clearRect(0,0,A,O),b.translate(A/2,O/2);const Q=A/I;b.scale(Q,Q),b.lineWidth=0.05;for(let T=0;T<E.point_n;++T){b.beginPath();const G=L[T*2],g=L[T*2+1];b.arc(G,g,0.075,0,Math.PI*2),b.stroke()}k.unmap()}const C=R();while(!0)await U(C),await new Promise(requestAnimationFrame)}var F=function(Z){let q=window.devicePixelRatio||1,H=Z.getBoundingClientRect();Z.width=H.width*q,Z.height=H.height*q;let D=Z.getContext("2d");return D.scale(q,q),D},R=function(){return F(document.querySelector("canvas"))};S();
