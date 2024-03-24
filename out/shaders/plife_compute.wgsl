@binding(0) @group(0) var<storage, read_write> colors: array<f32>; 
@binding(1) @group(0) var<storage, read_write> velocities: array<vec3<f32>>;
@binding(2) @group(0) var<storage, read_write> positions: array<vec3<f32>>;
@binding(3) @group(0) var<storage, read> F: array<f32>;

struct Params {
    dt: f32,
    n: f32,
    friction_factor: f32,
    r_max: f32,
    m: f32,
}

@binding(0) @group(1) var<uniform> p: Params;

fn force(r: f32, a: f32) -> f32{
    let beta = 0.3;
    if (r < beta) {
      return r/beta - 1;
    } else if (beta <= r && r <= 1) {
      return a * (1 - abs(2 * r-1-beta)/(1-beta));
    } else {
      return 0;
    }   
  }

fn fast_exp(x: f32) -> f32 {
  var t = 1.0 + x/32.0;
  t *= t; t *= t; t *= t; t *= t; t *= t; // t **= 32
  return t;

}


fn f_index(x: f32, y: f32) -> u32 {
    return u32(x + p.m * y);
}

@compute @workgroup_size(64)
fn update_velocities(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    var total_force = vec3(0.0);
    for (var j: u32 = 0; j < arrayLength(&positions); j = j + 1) {
        if (i == j) {continue;}
        var dr = positions[j] - positions[i];
        // if (dx > 0.5) dx -= 1;
        // if (dx < -0.5) dx += 1;
        // if (dy > 0.5) dy -= 1;
        // if (dy < -0.5) dy += 1;
        if (abs(dr.x) > 0.5) {
          dr.x = dr.x - sign(dr.x);
        }
        if (abs(dr.y) > 0.5) {
          dr.y = dr.y - sign(dr.y);
        }
        if (abs(dr.z) > 0.5) {
          dr.z = dr.z - sign(dr.z);
        }
        let r = sqrt(dr.x*dr.x + dr.y*dr.y + dr.z*dr.z);
        if (r > 0 && r < p.r_max) {
          let f = force(r / p.r_max, F[f_index(colors[i],colors[j])]);
          total_force += f * dr / r;
        }
    }
    total_force *= p.r_max * 5.0;
    velocities[i] = velocities[i] * p.friction_factor + total_force * p.dt;
    positions[i] += velocities[i] * p.dt;
    positions[i] = (positions[i] + 1) % 1;
}

@compute @workgroup_size(64) 
fn update_positions(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    let col = colors[i];
    let f = F[f_index(col,col)];
    positions[i] += velocities[i] * p.dt;
    positions[i] = (positions[i] + 1) % 1;
}
