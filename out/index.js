var Q=function(){let q=[];for(let b=0;b<6;b++){const u=[];for(let A=0;A<6;A++)u.push(Math.random()*2-1);q.push(u)}return q},S=function(q,b){if(q<0.3)return q/0.3-1;else if(0.3<=q&&q<=1)return b*(1-Math.abs(2*q-1-0.3)/0.7);else return 0},T=function(){for(let q=0;q<2000;q++){let b=0,u=0;for(let A=0;A<2000;A++){if(q==A)continue;const B=G[A]-G[q],E=H[A]-H[q],D=Math.sqrt(B*B+E*E);if(D>0&&D<0.1){const L=S(D/0.1,O[K[q]][K[A]]);b+=L*B/D,u+=L*E/D}}b*=1,u*=1,I[q]=I[q]*N+b*0.01,J[q]=J[q]*N+u*0.01}for(let q=0;q<2000;q++)G[q]+=I[q]*0.01,H[q]+=J[q]*0.01},U=function(q,b=1){for(let B=0;B<b;++B)T();const{width:u,height:A}=q.canvas;q.resetTransform(),q.clearRect(0,0,u,A),q.lineWidth=0.1,q.fillStyle="black",q.fillRect(0,0,u,A);for(let B=0;B<2000;++B){q.beginPath();const E=G[B]*u,D=H[B]*A;q.arc(E,D,5,0,Math.PI*2),q.fillStyle=`hsl(${K[B]*360/6}, 100%, 50%)`,q.fill(),q.stroke()}},V=function(q){let b=window.devicePixelRatio||1,u=q.getBoundingClientRect();q.width=u.width*b,q.height=u.height*b;let A=q.getContext("2d");return A.scale(b,b),A},W=function(){return V(document.querySelector("canvas"))};var N=Math.pow(0.5,0.25);var O=Q();console.log(O);var K=new Int32Array(2000),G=new Float32Array(2000),H=new Float32Array(2000),I=new Float32Array(2000),J=new Float32Array(2000);for(let q=0;q<2000;q++)K[q]=Math.floor(Math.random()*6),G[q]=Math.random(),H[q]=Math.random(),I[q]=0,J[q]=0;var Z=W();while(!0)U(Z),await new Promise(requestAnimationFrame);
