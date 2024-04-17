var e=async(J)=>{try{const D=await fetch(J);if(D.ok)return await D.text();else throw new Error(`Error loading: ${J}`)}catch(D){console.error(D)}},d=async(J,D)=>{const K=await e(D),N=J.createShaderModule({code:K}),T=await N.getCompilationInfo();if(T.messages.length>0){for(let I of T.messages)console.warn(`${I.message} 
  at ${D} line ${I.lineNum}`);throw new Error(`Could not compile ${D}`)}return N},E,l=async(J,D,K,N,T,I)=>{if(E){E(I);return}let X;if(window.getComputedStyle(document.body).backgroundColor=="rgb(255, 255, 255)")X="vec4(1.0)";else X="vec4(0.0, 0.0, 0.0, 1.0)";let Y=J.createShaderModule({code:`
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
        color += pixels[i32((fragUV.x * ${D}) + floor(fragUV.y * ${D}) * ${D})];
        return color;
      }
    `});const W=J.createRenderPipeline({layout:"auto",vertex:{module:Y,entryPoint:"vert"},fragment:{module:Y,entryPoint:"frag",targets:[{format:N}]},primitive:{topology:"triangle-list"}}),$=J.createBindGroup({layout:W.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:K,offset:0,size:D*D*16}}]});E=(Z)=>{const V=Z.beginRenderPass({colorAttachments:[{view:T.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}]});V.setPipeline(W),V.setBindGroup(0,$),V.draw(6,1,0,0),V.end()},E(I)};var r=function(){let J=[];for(let D=0;D<U.m;D++){const K=[];for(let N=0;N<U.m;N++)K.push(Math.random()*2-1);J.push(K)}return J};async function u(){const D=await(await navigator.gpu.requestAdapter()).requestDevice(),K=document.createElement("canvas");K.width=K.height=U.rez*R.scale,document.body.appendChild(K);const N=K.getContext("webgpu"),T="bgra8unorm";N.configure({device:D,format:T,alphaMode:"premultiplied"});const I=GPUShaderStage.COMPUTE,X=D.createBuffer({size:U.rez**2*A.vec4,usage:GPUBufferUsage.STORAGE}),Y=D.createBindGroupLayout({entries:[{visibility:I,binding:0,buffer:{type:"storage"}}]}),W=D.createBindGroup({layout:Y,entries:[{binding:0,resource:{buffer:X}}]}),$=D.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),Z=D.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM});D.queue.writeBuffer(Z,0,new Float32Array([U.time]));const V=D.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),h=D.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),w=D.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),C=D.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),S=D.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),G=D.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),L=D.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),P=D.createBuffer({size:A.f32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),x=D.createBindGroupLayout({entries:[{visibility:I,binding:0,buffer:{type:"uniform"}},{visibility:I,binding:1,buffer:{type:"uniform"}},{visibility:I,binding:2,buffer:{type:"uniform"}},{visibility:I,binding:3,buffer:{type:"uniform"}},{visibility:I,binding:4,buffer:{type:"uniform"}},{visibility:I,binding:5,buffer:{type:"uniform"}},{visibility:I,binding:6,buffer:{type:"uniform"}},{visibility:I,binding:7,buffer:{type:"uniform"}},{visibility:I,binding:8,buffer:{type:"uniform"}},{visibility:I,binding:9,buffer:{type:"uniform"}}]}),M=D.createBindGroup({layout:x,entries:[{binding:0,resource:{buffer:$}},{binding:1,resource:{buffer:Z}},{binding:2,resource:{buffer:V}},{binding:3,resource:{buffer:h}},{binding:4,resource:{buffer:w}},{binding:5,resource:{buffer:C}},{binding:6,resource:{buffer:S}},{binding:7,resource:{buffer:G}},{binding:8,resource:{buffer:L}},{binding:9,resource:{buffer:P}}]}),v=()=>{D.queue.writeBuffer($,0,new Float32Array([U.rez])),D.queue.writeBuffer(V,0,new Uint32Array([U.count])),D.queue.writeBuffer(h,0,new Float32Array([U.dt])),D.queue.writeBuffer(w,0,new Float32Array([U.frictionFactor])),D.queue.writeBuffer(C,0,new Float32Array([U.rMax])),D.queue.writeBuffer(S,0,new Uint32Array([U.m])),D.queue.writeBuffer(G,0,new Float32Array([U.binSidelength])),D.queue.writeBuffer(L,0,new Uint32Array([U.binCapacity])),D.queue.writeBuffer(P,0,new Uint32Array([U.binsPerSide])),R.agentWorkgroups=Math.ceil(U.count/256)};v();const t=D.createBuffer({size:A.vec3*U.count,usage:GPUBufferUsage.STORAGE}),a=D.createBuffer({size:A.vec3*U.count,usage:GPUBufferUsage.STORAGE}),g=D.createBuffer({size:A.f32*R.binCount*U.binCapacity,usage:GPUBufferUsage.STORAGE}),j=D.createBuffer({size:A.f32*R.binCount,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),y=D.createBuffer({size:A.f32*U.m*U.m,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});{const Q=new Float32Array(U.matrix.flat());D.queue.writeBuffer(y,0,Q)}const z=D.createBuffer({size:A.f32*U.count,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});{const Q=new Uint32Array(U.count);for(let O=0;O<U.count;O++)Q[O]=O%U.m;console.log(Q),D.queue.writeBuffer(z,0,Q)}const b=D.createBindGroupLayout({entries:[{visibility:I,binding:0,buffer:{type:"storage"}},{visibility:I,binding:1,buffer:{type:"storage"}},{visibility:I,binding:2,buffer:{type:"storage"}},{visibility:I,binding:3,buffer:{type:"storage"}},{visibility:I,binding:4,buffer:{type:"storage"}},{visibility:I,binding:5,buffer:{type:"storage"}}]}),F=D.createBindGroup({layout:b,entries:[{binding:0,resource:{buffer:t}},{binding:1,resource:{buffer:a}},{binding:2,resource:{buffer:z}},{binding:3,resource:{buffer:g}},{binding:4,resource:{buffer:j}},{binding:5,resource:{buffer:y}}]}),k=D.createPipelineLayout({bindGroupLayouts:[Y,x,b]}),q=await d(D,"./shaders/agents.wgsl"),m=D.createComputePipeline({layout:k,compute:{module:q,entryPoint:"reset"}}),p=D.createComputePipeline({layout:k,compute:{module:q,entryPoint:"writeBins"}}),o=D.createComputePipeline({layout:k,compute:{module:q,entryPoint:"simulate"}}),n=D.createComputePipeline({layout:k,compute:{module:q,entryPoint:"fade"}});(()=>{const Q=D.createCommandEncoder(),O=Q.beginComputePass();O.setPipeline(m),O.setBindGroup(0,W),O.setBindGroup(1,M),O.setBindGroup(2,F),O.dispatchWorkgroups(R.agentWorkgroups),O.end(),D.queue.submit([Q.finish()])})();let f=document.querySelector("#time"),i=document.querySelector("#fps");const c=async()=>{let Q=performance.now();const O=D.createCommandEncoder();O.clearBuffer(j,0,j.byteLength);{const H=O.beginComputePass();H.setBindGroup(0,W),H.setBindGroup(1,M),H.setBindGroup(2,F),H.setPipeline(p),H.dispatchWorkgroups(R.agentWorkgroups),H.end()}{const H=O.beginComputePass();H.setBindGroup(0,W),H.setBindGroup(1,M),H.setBindGroup(2,F),H.setPipeline(n),H.dispatchWorkgroups(R.pixelWorkgroups),H.setPipeline(o),H.dispatchWorkgroups(R.agentWorkgroups),H.end()}l(D,U.rez,X,T,N,O),D.queue.submit([O.finish()]),await D.queue.onSubmittedWorkDone(),D.queue.writeBuffer(Z,0,new Float32Array([U.time++]));let B=performance.now()-Q;f.textContent=`${B}ms  (${Math.round(1000/B)}fps)`,setTimeout(c,0)};c();let _=new lil.GUI;_.add(U,"dt").min(0.01).max(0.5),_.add(U,"rMax").min(0.01).max(0.9),_.add(U,"m").min(1).max(24),_.add(U,"count").min(1).max(U.count).step(1),_.onChange(v)}var A={f32:4,u32:4,i32:4,vec2:8,vec3:12,vec4:16},U={rez:2048,time:0,dt:0.08,frictionFactor:0,rMax:320,m:12,matrix:[],count:2000000,binSidelength:512,binCapacity:3200};U.binsPerSide=Math.ceil(U.rez/U.binSidelength);U.frictionFactor=Math.pow(0.5,U.dt/0.04);U.matrix=r();var R={binCount:U.binsPerSide**3,scale:0.95*Math.min(window.innerHeight,window.innerWidth)/U.rez,pixelWorkgroups:Math.ceil(U.rez**2/256),agentWorkgroups:Math.ceil(U.count/256)};u();
