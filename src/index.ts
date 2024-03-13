const point_n = 1000

let params = {
  mu_k: 2.0, sigma_k: .5, w_k: 0.015,
  mu_g: 0.3, sigma_g: 0.075, c_rep: 1.0,
  dt: 0.025
}

let fields = ({
  R_val:  new Float32Array(point_n),
  U_val:  new Float32Array(point_n),
  R_grad: new Float32Array(point_n*2),
  U_grad: new Float32Array(point_n*2),
})



function init(points: Float32Array) {
  for (let i=0; i<point_n; ++i) {
    points[i*2]   = (Math.random()-0.5)*12;
    points[i*2+1] = (Math.random()-0.5)*12;
  }
  return points;
}

let points = init(new Float32Array(point_n*2));

function add_xy(a, i, x, y, c) {
  a[i*2] += x*c; a[i*2+1] += y*c;
}


function compute_fields() {
  const {R_val, U_val, R_grad, U_grad} = fields;
  const {c_rep, mu_k, sigma_k, w_k} = params;
  // account for the own field of each particle
  R_val.fill(repulsion_f(0.0, c_rep)[0]);
  U_val.fill(peak_f(0.0, mu_k, sigma_k, w_k)[0]);
  R_grad.fill(0); U_grad.fill(0);

  for (let i=0; i<point_n-1; ++i)
  for (let j=i+1; j<point_n; ++j) {
    let rx = points[i*2]   - points[j*2];
    let ry = points[i*2+1] - points[j*2+1];
    const r = Math.sqrt(rx*rx + ry*ry) + 1e-20;
    rx /= r; ry /= r;  // ∇r = [rx, ry]
  
    if (r < 1.0) {
      // ∇R = R'(r) ∇r
      const [R, dR] = repulsion_f(r, c_rep);
      add_xy(R_grad, i, rx, ry,  dR);
      add_xy(R_grad, j, rx, ry, -dR);
      R_val[i] += R; R_val[j] += R;
    }
    // ∇K = K'(r) ∇r
    const [K, dK] = peak_f(r, mu_k, sigma_k, w_k);
    add_xy(U_grad, i, rx, ry,  dK);
    add_xy(U_grad, j, rx, ry, -dK);
    U_val[i] += K; U_val[j] += K;
  }
}

function repulsion_f(x, c_rep) {
  const t = Math.max(1.0-x, 0.0);
  return [0.5*c_rep*t*t, -c_rep*t];
}

function fast_exp(x) {
  let t = 1.0 + x/32.0;
  t *= t; t *= t; t *= t; t *= t; t *= t; // t **= 64
  return t;
}

function peak_f(x, mu, sigma, w=1.0) {
  const t = (x-mu)/sigma;
  const y = w / fast_exp(t*t);
  return [y, -2.0*t*y/sigma];
}

function step() {
  const {R_val, U_val, R_grad, U_grad} = fields;
  const {mu_g, sigma_g, dt} = params;
  compute_fields();
  let total_E = 0.0;
  for (let i=0; i<point_n; ++i) {
    const [G, dG] = peak_f(U_val[i], mu_g, sigma_g);
     // [vx, vy] = -∇E = G'(U)∇U - ∇R
    const vx = dG*U_grad[i*2]   - R_grad[i*2];
    const vy = dG*U_grad[i*2+1] - R_grad[i*2+1];
    add_xy(points, i, vx, vy, dt);
    total_E += R_val[i] - G;
  }
  return total_E / point_n;
}

function animate(ctx, world_width=40.0, steps_per_frame=5) {
  for (let i=0; i<steps_per_frame; ++i) step();
  const {width, height} = ctx.canvas;
  ctx.resetTransform();
  ctx.clearRect(0, 0, width, height);
  ctx.translate(width/2, height/2);
  const s = width/world_width;
  ctx.scale(s, s);
  ctx.lineWidth = 0.1;
  for (let i=0; i<point_n; ++i) {
    ctx.beginPath();
    const x=points[i*2], y=points[i*2+1];
    const r = params.c_rep / (fields.R_val[i]*5.0);
    ctx.arc(x, y, r, 0.0, Math.PI*2);
    ctx.stroke();        
  }
}

function setupCanvas(canvas) {
  // Get the device pixel ratio, falling back to 1.
  let dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  let rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  let ctx = canvas.getContext('2d');
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the scaling in your drawing code.
  ctx.scale(dpr, dpr);

  return ctx;

  // Now you can just draw at the "normal" size.
}

function resizeCanvas() {
  let ctx = setupCanvas(document.querySelector('canvas'));
  // Redraw canvas content after resizing here
  return ctx;
}

const ctx = resizeCanvas();
while (true) {
  animate(ctx);
  await new Promise(requestAnimationFrame);
}