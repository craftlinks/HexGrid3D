@binding(0) @group(0) var<storage, read_write> colors: array<f32>; 
@binding(1) @group(0) var<storage, read_write> velocities: array<vec3<f32>>;
@binding(2) @group(0) var<storage, read_write> positions: array<vec4<f32>>;
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
    let beta = 0.1;
    if (r < beta) {
      return  r/beta - 5.0;
    } else if (beta < r && r < 1.0) {
      return a * (1 - abs(2 * r-1-beta)/(1-beta) * 2) ;
    } else {
      return -10000.0;
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
    if (i >= arrayLength(&positions)) {return;}
    var total_force = vec3(0.0);
    for (var j: u32 = 0; j < arrayLength(&positions); j = j + 1) {
        if (i == j) {continue;}
        var diff = positions[j].xyz - positions[i].xyz;

        // if (dx > 0.5) dx -= 1;
        // if (dx < -0.5) dx += 1;
        // if (dy > 0.5) dy -= 1;
        // if (dy < -0.5) dy += 1;
        // if (abs(diff.x) > 0.5) {
        //   diff.x = diff.x - sign(diff.x);
        // }
        // if (abs(diff.y) > 0.5) {
        //   diff.y = diff.y - sign(diff.y);
        // }
        // if (abs(diff.z) > 0.5) {
        //   diff.z = diff.z - sign(diff.z);
        // }
        let dist = sqrt(diff.x*diff.x + diff.y*diff.y + diff.z*diff.z);
        if ( dist > 0 && dist < p.r_max) {
          let forceV = F[f_index(colors[i],colors[j])];
          var f = force(dist, forceV);

          // if (f > 0.0) {
          //   f = f * fast_exp(-dist);
          // }
          // if (f < 0.0) {
          //   f = f * fast_exp(dist);
          // }
          total_force += f * diff / dist;
          total_force = total_force * p.r_max;
        }
    }
    velocities[i] = velocities[i] + total_force * p.dt *5;
    velocities[i] = velocities[i] * p.friction_factor;
}

@compute @workgroup_size(64) 
fn update_positions(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    let col = colors[i];
    let f = F[f_index(col,col)];
    positions[i] += vec4(velocities[i], 1.0) * p.dt;
}
