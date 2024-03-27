var e=async(H)=>{try{const I=await fetch(H);if(I.ok)return await I.text();else throw new Error(`Error loading: ${H}`)}catch(I){console.error(I)}},l=async(H,I)=>{const J=await e(I),K=H.createShaderModule({code:J}),V=await K.getCompilationInfo();if(V.messages.length>0){for(let T of V.messages)console.warn(`${T.message} 
  at ${I} line ${T.lineNum}`);throw new Error(`Could not compile ${I}`)}return K},k,d=async(H,I,J,K,V,T)=>{if(k){k(T);return}let Y;if(window.getComputedStyle(document.body).backgroundColor=="rgb(255, 255, 255)")Y="vec4(1.0)";else Y="vec4(0.0, 0.0, 0.0, 1.0)";let Z=H.createShaderModule({code:`
      @group(0) @binding(0)  
      var<storage, read_write> pixels : array<vec4f>;

      struct VertexOutput {
        @builtin(position) Position : vec4f,
          @location(0) fragUV : vec2f,
      }
      
      @vertex
      fn vert(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {
      
        const pos = array(
          vec2( 1.0,  1.0),
          vec2( 1.0, -1.0),
          vec2(-1.0, -1.0),
          vec2( 1.0,  1.0),
          vec2(-1.0, -1.0),
          vec2(-1.0,  1.0),
        );
      
        const uv = array(
          vec2(1.0, 0.0),
          vec2(1.0, 1.0),
          vec2(0.0, 1.0),
          vec2(1.0, 0.0),
          vec2(0.0, 1.0),
          vec2(0.0, 0.0),
        );

        var output : VertexOutput;
        output.Position = vec4(pos[VertexIndex], 0.0, 1.0);
        output.fragUV = uv[VertexIndex];
        return output;
      }
      
      @fragment
      fn frag(@location(0) fragUV : vec2f) -> @location(0) vec4f {
        var color = vec4(0, 0, 0, 1.0);
        color += pixels[i32((fragUV.x * ${I}) + floor(fragUV.y * ${I}) * ${I})];
        return color;
      }
    `});const X=H.createRenderPipeline({layout:"auto",vertex:{module:Z,entryPoint:"vert"},fragment:{module:Z,entryPoint:"frag",targets:[{format:K}]},primitive:{topology:"triangle-list"}}),q=H.createBindGroup({layout:X.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:J,offset:0,size:I*I*16}}]});k=(_)=>{const W=_.beginRenderPass({colorAttachments:[{view:V.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}]});W.setPipeline(X),W.setBindGroup(0,q),W.draw(6,1,0,0),W.end()},k(T)};var r=function(){let H=[];for(let I=0;I<O.m;I++){const J=[];for(let K=0;K<O.m;K++)J.push(Math.random()*2-1);H.push(J)}return H};async function u(){const I=await(await navigator.gpu.requestAdapter()).requestDevice(),J=document.createElement("canvas");J.width=J.height=O.rez*Q.scale,document.body.appendChild(J);const K=J.getContext("webgpu"),V="bgra8unorm";K.configure({device:I,format:V,alphaMode:"premultiplied"});const T=GPUShaderStage.COMPUTE,Y=I.createBuffer({size:O.rez**2*A.vec4,usage:GPUBufferUsage.STORAGE}),Z=I.createBindGroupLayout({entries:[{visibility:T,binding:0,buffer:{type:"storage"}}]}),X=I.createBindGroup({layout:Z,entries:[{binding:0,resource:{buffer:Y}}]}),q=I.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),_=I.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM});I.queue.writeBuffer(_,0,new Float32Array([O.time]));const W=I.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),F=I.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),h=I.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),L=I.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),w=I.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),S=I.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),G=I.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),P=I.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),x=I.createBindGroupLayout({entries:[{visibility:T,binding:0,buffer:{type:"uniform"}},{visibility:T,binding:1,buffer:{type:"uniform"}},{visibility:T,binding:2,buffer:{type:"uniform"}},{visibility:T,binding:3,buffer:{type:"uniform"}},{visibility:T,binding:4,buffer:{type:"uniform"}},{visibility:T,binding:5,buffer:{type:"uniform"}},{visibility:T,binding:6,buffer:{type:"uniform"}},{visibility:T,binding:7,buffer:{type:"uniform"}},{visibility:T,binding:8,buffer:{type:"uniform"}},{visibility:T,binding:9,buffer:{type:"uniform"}}]}),E=I.createBindGroup({layout:x,entries:[{binding:0,resource:{buffer:q}},{binding:1,resource:{buffer:_}},{binding:2,resource:{buffer:W}},{binding:3,resource:{buffer:F}},{binding:4,resource:{buffer:h}},{binding:5,resource:{buffer:L}},{binding:6,resource:{buffer:w}},{binding:7,resource:{buffer:S}},{binding:8,resource:{buffer:G}},{binding:9,resource:{buffer:P}}]}),v=()=>{I.queue.writeBuffer(q,0,new Float32Array([O.rez])),I.queue.writeBuffer(W,0,new Uint32Array([O.count])),I.queue.writeBuffer(F,0,new Float32Array([O.dt])),I.queue.writeBuffer(h,0,new Float32Array([O.frictionFactor])),I.queue.writeBuffer(L,0,new Float32Array([O.rMax])),I.queue.writeBuffer(w,0,new Uint32Array([O.m])),I.queue.writeBuffer(S,0,new Float32Array([O.binSidelength])),I.queue.writeBuffer(G,0,new Uint32Array([O.binCapacity])),I.queue.writeBuffer(P,0,new Uint32Array([O.binsPerSide])),Q.agentWorkgroups=Math.ceil(O.count/256)};v();const m=I.createBuffer({size:A.vec3*O.count,usage:GPUBufferUsage.STORAGE}),g=I.createBuffer({size:A.vec3*O.count,usage:GPUBufferUsage.STORAGE}),a=I.createBuffer({size:A.f32*Q.binCount*O.binCapacity,usage:GPUBufferUsage.STORAGE}),M=I.createBuffer({size:A.f32*Q.binCount,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),y=I.createBuffer({size:A.f32*O.m*O.m,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});{const N=new Float32Array(O.matrix.flat());I.queue.writeBuffer(y,0,N)}const z=I.createBuffer({size:A.f32*O.count,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});{const N=new Uint32Array(O.count);for(let U=0;U<O.count;U++)N[U]=U%O.m;console.log(N),I.queue.writeBuffer(z,0,N)}const b=I.createBindGroupLayout({entries:[{visibility:T,binding:0,buffer:{type:"storage"}},{visibility:T,binding:1,buffer:{type:"storage"}},{visibility:T,binding:2,buffer:{type:"storage"}},{visibility:T,binding:3,buffer:{type:"storage"}},{visibility:T,binding:4,buffer:{type:"storage"}},{visibility:T,binding:5,buffer:{type:"storage"}}]}),C=I.createBindGroup({layout:b,entries:[{binding:0,resource:{buffer:m}},{binding:1,resource:{buffer:g}},{binding:2,resource:{buffer:z}},{binding:3,resource:{buffer:a}},{binding:4,resource:{buffer:M}},{binding:5,resource:{buffer:y}}]}),R=I.createPipelineLayout({bindGroupLayouts:[Z,x,b]}),j=await l(I,"./shaders/agents.wgsl"),t=I.createComputePipeline({layout:R,compute:{module:j,entryPoint:"reset"}}),p=I.createComputePipeline({layout:R,compute:{module:j,entryPoint:"writeBins"}}),o=I.createComputePipeline({layout:R,compute:{module:j,entryPoint:"simulate"}}),n=I.createComputePipeline({layout:R,compute:{module:j,entryPoint:"fade"}});(()=>{const N=I.createCommandEncoder(),U=N.beginComputePass();U.setPipeline(t),U.setBindGroup(0,X),U.setBindGroup(1,E),U.setBindGroup(2,C),U.dispatchWorkgroups(Q.agentWorkgroups),U.end(),I.queue.submit([N.finish()])})();let f=document.querySelector("#time"),i=document.querySelector("#fps");const c=async()=>{let N=performance.now();const U=I.createCommandEncoder();U.clearBuffer(M,0,M.byteLength);{const D=U.beginComputePass();D.setBindGroup(0,X),D.setBindGroup(1,E),D.setBindGroup(2,C),D.setPipeline(p),D.dispatchWorkgroups(Q.agentWorkgroups),D.end()}{const D=U.beginComputePass();D.setBindGroup(0,X),D.setBindGroup(1,E),D.setBindGroup(2,C),D.setPipeline(n),D.dispatchWorkgroups(Q.pixelWorkgroups),D.setPipeline(o),D.dispatchWorkgroups(Q.agentWorkgroups),D.end()}d(I,O.rez,Y,V,K,U),I.queue.submit([U.finish()]),await I.queue.onSubmittedWorkDone(),I.queue.writeBuffer(_,0,new Float32Array([O.time++]));let B=performance.now()-N;f.textContent=`${B}ms  (${Math.round(1000/B)}fps)`,setTimeout(c,0)};c();let $=new lil.GUI;$.add(O,"dt").min(0.01).max(0.5),$.add(O,"rMax").min(0.01).max(0.9),$.add(O,"m").min(1).max(24),$.add(O,"count").min(1).max(O.count).step(1),$.onChange(v)}var A={f32:4,u32:4,i32:4,vec2:8,vec3:12,vec4:16},O={rez:1024,time:0,dt:0.02,frictionFactor:0,rMax:256,m:12,matrix:[],count:150000,binSidelength:400,binCapacity:750};O.binsPerSide=Math.ceil(O.rez/O.binSidelength);O.frictionFactor=Math.pow(0.5,O.dt/0.04);O.matrix=r();var Q={binCount:O.binsPerSide**3,scale:0.95*Math.min(window.innerHeight,window.innerWidth)/O.rez,pixelWorkgroups:Math.ceil(O.rez**2/256),agentWorkgroups:Math.ceil(O.count/256)};u();
