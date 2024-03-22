
const dt = 0.01;
const n = 1500;
const frictionFactor = Math.pow(0.5, dt/0.04);
const rMax = 0.25;
const m = 6;
const matrix = makeRandomMatrix();

function makeRandomMatrix() {
  let matrix = [];
  for (let i = 0; i < m; i++) {
    const row = [];
    for (let j = 0; j < m; j++) {
      row.push(Math.random() * 2 - 1);
    }
    matrix.push(row);
  }
  return matrix;
}

console.log(matrix);

const colors = new Int32Array(n);
const positionsX = new Float32Array(n);
const positionsY = new Float32Array(n);
const positionsZ = new Float32Array(n);
const velocitiesX = new Float32Array(n);
const velocitiesY = new Float32Array(n);
const velocitiesZ = new Float32Array(n);


for (let i = 0; i < n; i++) {
  colors[i] = Math.floor(Math.random() * m); // 0 - (m-1)
  positionsX[i] = Math.random(); // -1:1
  positionsY[i] = Math.random(); // -1:1
  positionsZ[i] = Math.random(); // -1:1
  velocitiesX[i] = 0.0;
  velocitiesY[i] = 0.0;
  velocitiesZ[i] = 0.0;
}

function force(r, a) {
  const beta = 0.1;
  if (r < beta) {
    return r/beta - 1;
  } else if (beta <= r && r <= 1) {
    return a * (1 - Math.abs(2 * r-1-beta)/(1-beta));
  } else {
    return 0;
  }   
}

function updateParticles() {
  // update velocities
  for (let i = 0; i < n; i++) {
    let totalForceX = 0.0;
    let totalForceY = 0.0;
    let totalForceZ = 0.0;
    
    for (let j = 0; j < n; j++) {
      if (i == j) continue;
      let dx = positionsX[j] - positionsX[i];
      let dy = positionsY[j] - positionsY[i];
      let dz = positionsZ[j] - positionsZ[i];
      // if (dx > 0.5) dx -= 1;
      // if (dx < -0.5) dx += 1;
      // if (dy > 0.5) dy -= 1;
      // if (dy < -0.5) dy += 1;
      if (Math.abs(dx) > 0.5) {
        dx = dx - Math.sign(dx);
      }
      if (Math.abs(dy) > 0.5) {
        dy = dy - Math.sign(dy);
      }
      if (Math.abs(dz) > 0.5) {
        dz = dz - Math.sign(dz);
      }
      
      const r = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (r > 0 && r < rMax) {
        const f = force(r / rMax, matrix[colors[i]][colors[j]]);
        totalForceX += f * dx / r;
        totalForceY += f * dy / r; 
        totalForceZ += f * dz / r;
      }
    }
    totalForceX *= rMax * 10;
    totalForceY *= rMax * 10;
    totalForceZ *= rMax * 10;

    velocitiesX[i] = velocitiesX[i] * frictionFactor + totalForceX * dt;
    velocitiesY[i] = velocitiesY[i] * frictionFactor + totalForceY * dt;
    velocitiesZ[i] = velocitiesZ[i] * frictionFactor + totalForceZ * dt;
  }

  // update positions
  for (let i = 0; i < n; i++) {
    positionsX[i] += velocitiesX[i] * dt;
    positionsY[i] += velocitiesY[i] * dt;
    positionsZ[i] += velocitiesZ[i] * dt;

    positionsX[i] = (positionsX[i] + 1) % 1;
    positionsY[i] = (positionsY[i] + 1) % 1;
    positionsZ[i] = (positionsZ[i] + 1) % 1;
  }
}

function animate(ctx, steps_per_frame=1) {
  for (let i=0; i<steps_per_frame; ++i) updateParticles();
  const {width, height} = ctx.canvas;
  ctx.resetTransform();
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 0.1;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);
  for (let i=0; i<n; ++i) {
    ctx.beginPath();
    const x=(positionsX[i]) * width , y=(positionsY[i]) * height
    ctx.arc(x, y, 3.6, 0.0, Math.PI*2);
    ctx.fillStyle = `hsl(${colors[i]*360/m}, 100%, 40%)`;
    ctx.fill();
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