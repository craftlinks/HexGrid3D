var h=function(b){for(let F=0;F<A.point_n;++F)b[F*2]=(Math.random()-0.5)*12,b[F*2+1]=(Math.random()-0.5)*12;return b},V=function(b,F,N,S,B){b[F*2]+=N*B,b[F*2+1]+=S*B},G=function(){const{R_val:b,U_val:F,R_grad:N,U_grad:S}=Y,{c_rep:B,mu_k:J,sigma_k:H,w_k:O}=A;b.fill(E(0,B)[0]),F.fill(X(0,J,H,O)[0]),N.fill(0),S.fill(0);for(let q=0;q<A.point_n-1;++q)for(let I=q+1;I<A.point_n;++I){let L=Q[q*2]-Q[I*2],M=Q[q*2+1]-Q[I*2+1];const P=Math.sqrt(L*L+M*M)+0.00000000000000000001;if(L/=P,M/=P,P<1){const[z,C]=E(P,B);V(N,q,L,M,C),V(N,I,L,M,-C),b[q]+=z,b[I]+=z}const[Z,$]=X(P,J,H,O);V(S,q,L,M,$),V(S,I,L,M,-$),F[q]+=Z,F[I]+=Z}},E=function(b,F){const N=Math.max(1-b,0);return[0.5*F*N*N,-F*N]},D=function(b){let F=1+b/32;return F*=F,F*=F,F*=F,F*=F,F*=F,F},X=function(b,F,N,S=1){const B=(b-F)/N,J=S/D(B*B);return[J,-2*B*J/N]},K=function(){const{R_val:b,U_val:F,R_grad:N,U_grad:S}=Y,{mu_g:B,sigma_g:J,dt:H}=A;G();let O=0;for(let q=0;q<A.point_n;++q){const[I,L]=X(F[q],B,J),M=L*S[q*2]-N[q*2],P=L*S[q*2+1]-N[q*2+1];V(Q,q,M,P,H),O+=b[q]-I}return O/A.point_n},U=function(b,F=45,N=5){for(let H=0;H<N;++H)K();const{width:S,height:B}=b.canvas;b.resetTransform(),b.clearRect(0,0,S,B),b.translate(S/2,B/2);const J=S/F;b.scale(J,J),b.lineWidth=0.1;for(let H=0;H<A.point_n;++H){b.beginPath();const O=Q[H*2],q=Q[H*2+1],I=A.c_rep/(Y.R_val[H]*5);b.arc(O,q,I,0,Math.PI*2),b.stroke()}},j=function(b){let F=window.devicePixelRatio||1,N=b.getBoundingClientRect();b.width=N.width*F,b.height=N.height*F;let S=b.getContext("2d");return S.scale(F,F),S},w=function(){return j(document.querySelector("canvas"))},A={mu_k:4,sigma_k:1,w_k:0.022,mu_g:0.6,sigma_g:0.15,c_rep:1,dt:0.02,point_n:750},W={mu_g:{min:0,max:2,step:0.1},sigma_g:{min:0.1,max:1,step:0.1},w_k:{min:0,max:0.1,step:0.01},mu_k:{min:0,max:10,step:1},sigma_k:{min:0.1,max:1,step:0.1},c_rep:{min:0,max:1,step:0.1},dt:{min:0,max:0.1,step:0.01},point_n:{min:100,max:1000,step:100}},T=document.querySelector("canvas");for(let b in A){let F=document.createElement("label");F.textContent=b,F.htmlFor=b;let N=document.createElement("input");N.type="range",N.id=b,N.value=A[b],N.min=W[b].min,N.max=W[b].max,N.step=W[b].step,N.style.margin="0 5px";let S=document.createElement("span");S.id=b+"_value",S.textContent=A[b],S.style.margin="0 5px",N.addEventListener("input",function(){A[this.id]=this.value,this.value=A[this.id],document.getElementById(this.id+"_value").textContent=this.value}),T.parentNode.insertBefore(F,T),T.parentNode.insertBefore(N,T),T.parentNode.insertBefore(S,T)}var Y={R_val:new Float32Array(A.point_n),U_val:new Float32Array(A.point_n),R_grad:new Float32Array(A.point_n*2),U_grad:new Float32Array(A.point_n*2)},Q=h(new Float32Array(A.point_n*2)),f=w();while(!0)U(f),await new Promise(requestAnimationFrame);
