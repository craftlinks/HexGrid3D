// Pixels
@group(0) @binding(0)  
  var<storage, read_write> pixels : array<vec4f>;

// Uniforms
@group(1) @binding(0)  
  var<uniform> rez : f32;

@group(1) @binding(1) 
  var<uniform> time : f32;

@group(1) @binding(2)  
  var<uniform> count : u32;

@group(1) @binding(3)  
  var<uniform> dt : f32;

@group(1) @binding(4)  
  var<uniform> frictionFactor : f32;

@group(1) @binding(5)  
  var<uniform> rMax : f32;

@group(1) @binding(6)  
  var<uniform> m : u32;

@group(1) @binding(7)  
  var<uniform> binSidelength : f32;

@group(1) @binding(8)  
  var<uniform> binCapacity : u32;

@group(1) @binding(9)  
  var<uniform> binsPerSide : u32;


// Other buffers
@group(2) @binding(0)  
  var<storage, read_write> positions : array<vec3f>;

@group(2) @binding(1)  
  var<storage, read_write> velocities : array<vec3f>;

@group(2) @binding(2)  
  var<storage, read_write> colors : array<u32>;

@group(2) @binding(3)  
  var<storage, read_write> bins : array<u32>;

@group(2) @binding(4)  
  var<storage, read_write> binCountsAtomic : array<atomic<u32>>;

@group(2) @binding(5)  
  var<storage, read_write> matrix : array<f32>;

fn r(n: f32) -> f32 {
  let x = sin(n) * 43758.5453;
  return fract(x);
}

fn index(p: vec2f) -> i32 {
  return i32(p.x) + i32(p.y) * i32(rez);
}

fn binIndex(position: vec2f) -> u32 {
  let x = u32(floor((position.x ) / binSidelength));
  let y = u32(floor((position.y) / binSidelength));
  return x + y * binsPerSide;
}

@compute @workgroup_size(256)
fn writeBins(@builtin(global_invocation_id) id : vec3u) {
  var p = positions[id.x];
  let bin = binIndex(p.xy);
  let offset = atomicAdd(&binCountsAtomic[bin], 1u);
  if(offset < binCapacity) {
    bins[bin * binCapacity + offset] = id.x;
  }
}

@compute @workgroup_size(256)
fn reset(@builtin(global_invocation_id) id : vec3u) {
  let seed = f32(id.x)/f32(count);
  var p = vec3(r(seed), r(seed + 0.1), 0.0);
  p *= rez;
  positions[id.x] = p;
}

fn hsv2rgb(h : f32, s: f32, v: f32) -> vec3f
{
  var c = vec3(h, s, v);
  var K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  var p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, vec3(0.0), vec3(1.0)), c.y);
}

fn force(r: f32, a: f32) -> f32 {
  return a * (rMax/2.0 - r);
}

@compute @workgroup_size(256)
fn simulate(@builtin(global_invocation_id) id : vec3u) {
  let p = positions[id.x];
  var totalForce = vec2f(0.0);
  let binX = i32(floor((p.x) / binSidelength));
  let binY = i32(floor((p.y) / binSidelength));
  for(var x=-1; x <=1; x++) {
    for(var y=-1; y <=1; y++) {

      // todo: edges
      let bin = (binX + x) + (binY + y) * i32(binsPerSide);
      let count = atomicLoad(&binCountsAtomic[bin]);
      let start = u32(bin) * binCapacity;
      let binCount = min(binCapacity, count);
      
      for(var i=0u; i<binCount; i++) {
        let oid = bins[start + i];
        if(oid == id.x) { continue; }
        var op = positions[oid];
        var distance = positions[i] - positions[id.x];
        if (distance.x > rez/2.0) { distance.x -= rez; }
        if (distance.y > rez/2.0) { distance.y -= rez; }
        if (distance.x < -rez/2.0) { distance.x += rez; }
        if (distance.y < -rez/2.0) { distance.y += rez; }
        
        let r = sqrt(distance.x*distance.x + distance.y*distance.y);
        let repf = 24.0;
        if (r > 0 && r < rMax) {
          if (r > repf) {
            let a = matrix[colors[id.x] + m * colors[i]];
            
            totalForce += a * max(50.0 - abs(r - (rMax/2)),0.0) * distance.xy / r;
          } else {
            let f =  50 * (r/repf - 1.0);
            totalForce += f * distance.xy / r;
          }
        }
      }
    }
  }
  // totalForce +=  1.0; ;

  velocities[id.x] = vec3f(velocities[id.x].xy * 0.4 + totalForce * dt, 0.0);


  // Write
  positions[id.x] = positions[id.x] + velocities[id.x] * dt;
  positions[id.x] = (positions[id.x] + rez) % rez;

  // Draw
  pixels[index(positions[id.x].xy)] = vec4(hsv2rgb(f32(colors[id.x]) / f32(m), 1.0, 1.0), 1.0);
}


@compute @workgroup_size(256)
fn fade(@builtin(global_invocation_id) id : vec3u) {
  pixels[id.x] *= 0.95;
}