function D(R,Y,H){Y.set(R);function q(E,Q){let T=(E+H[0])%H[0];return(Q+H[1])%H[1]*H[0]+T}function J(E,Q,T,Z){if(Z==0)return;let U=E,F=Q;for(var M=0;M<T;M=M+1){let $=h(Q);U=U-$,F=F-1}var W=Z,N=[U,F];for(var M=0;M<6;M=M+1)for(var X=0;X<T;X=X+1){if(W<=0)break;Y[q(N[0],N[1])]+=1,Y[q(E,Q)]-=1,W=W-1,N=c(N[0],N[1],o[M])}}for(var w=0;w<H[1];w=w+1)for(var C=0;C<H[0];C=C+1){let E=R[q(C,w)];if(E>0)J(C,w,1,E)}return R}var c=function(R,Y,H){let q=h(Y);if(H[1]==0)return[R+H[0],Y];else return[R+H[0]-q,Y+H[1]]},h=function(R){return R&1},o=[[1,0],[1,1],[0,1],[-1,0],[0,-1],[1,-1]];async function d(){const R=[64,64],Y=1/Math.max(R[0],R[1]),q=await(await navigator.gpu?.requestAdapter())?.requestDevice();if(!q){fail("need a browser that supports WebGPU");return}else console.log("WebGPU is supported");const J=document.querySelector("canvas"),w=J.getContext("webgpu"),C=navigator.gpu.getPreferredCanvasFormat();w.configure({device:q,format:C});const E=await fetch("./shaders/hexgrid3d_vertex.wgsl").then((K)=>K.text()),Q=await fetch("./shaders/hexgrid3d_fragment.wgsl").then((K)=>K.text()),T=q.createShaderModule({label:"HexGrid3D vertex shader",code:E}),Z=q.createShaderModule({label:"HexGrid3D fragment shader",code:Q}),U=8,F=16,M=16,W=4,N=R[0]*R[1]*U,X=M,$=R[0]*R[1]*W,V=q.createBuffer({label:"Hex attributes storage buffer for objects",size:N,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),B=q.createBuffer({label:"global attributes uniform",size:X,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),x=0,s=2;{const K=new Float32Array(N/4);for(let L=0;L<R[0]*R[1];++L){const A=L*(U/4);let k=L%R[0],j=Math.floor(L/R[0]);j%2==1||(k+=0.5),K.set([k*Math.sqrt(3)*Y,j*3/2*Y],A)}q.queue.writeBuffer(V,0,K)}const p=q.createBuffer({label:"state buffer 0",size:$,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),O=new Int32Array($/4),P=new Int32Array($/4);for(let K=0;K<R[0]*R[1];++K){const L=K*(W/4);if(K==R[0]*R[1]/2+R[0]/2)O.set([96],L),P.set(O)}const{vertexData:z,numVertices:_}=a({hexSize:Y,center:{x:-1-Y,y:-1+Y}}),g=q.createBuffer({label:"storage buffer vertices",size:z.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});q.queue.writeBuffer(g,0,z);const S=q.createRenderPipeline({label:"HexGrid3D pipeline",layout:"auto",vertex:{module:T,entryPoint:"vs"},fragment:{module:Z,entryPoint:"fs",targets:[{format:C}]}}),f=q.createBindGroup({label:"flip bind group for objects",layout:S.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:V}},{binding:1,resource:{buffer:p}},{binding:2,resource:{buffer:B}},{binding:3,resource:{buffer:g}}]}),y={label:"our basic canvas renderPass",colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]},G=new Float32Array(X/4);function b(K){var L=K;J.width=Math.max(1,q.limits.maxTextureDimension2D),J.height=Math.max(1,q.limits.maxTextureDimension2D);const A=L==1?O:P,k=L==1?P:O,j=D(A,k,R);y.colorAttachments[0].view=w.getCurrentTexture().createView();const v=q.createCommandEncoder({label:"our simulation renderer encoder"}),I=v.beginRenderPass(y);I.setPipeline(S);const m=J.width/J.height,l=1;G.set([l/m,l,R[0],R[1]],0),q.queue.writeBuffer(B,0,G),q.queue.writeBuffer(p,0,j),I.setBindGroup(0,f),I.draw(_,R[0]*R[1]),I.end();const u=v.finish();q.queue.submit([u]),L=1-L,setTimeout(()=>{b(L)},50)}b(1)}var a=function({hexSize:R=0.1,center:Y={x:0,y:0}}={}){const q=new Float32Array(36),J=new Float32Array(12);for(let w=0;w<6;w++){const C=w*2,E=2*Math.PI*((w+0.5)/6);J[C]=R*Math.cos(E),J[C+1]=R*Math.sin(E)}for(let w=0;w<6;w++){const C=w*6,E=w*2;q[C+0]=Y.x,q[C+1]=Y.y,q[C+2]=Y.x+J[E],q[C+3]=Y.y+J[E+1],q[C+4]=Y.x+J[(E+2)%12],q[C+5]=Y.y+J[(E+3)%12]}return{vertexData:q,numVertices:18}};d();