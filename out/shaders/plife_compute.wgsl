@binding(0) @group(0) var<storage, read_write> colors: array<f32>; 
@binding(1) @group(0) var<storage, read_write> velocities: array<vec3<f32>>;
@binding(2) @group(0) var<storage, read_write> positions: array<vec3<f32>>;
@binding(3) @group(0) var<storage, read> F: array<f32>;

struct Params {
    repulsion: f32,
    inertia: f32,
    dt: f32,
    n_agents: u32,
    K: f32,
    world_extent: f32,
}

@binding(0) @group(1) var<uniform> p: Params;

fn force(r: f32, a: f32) -> f32{
    let beta = 0.2;
    if (r < beta) {
      return r/beta - 1;
    } else if (beta <= r && r <= 1) {
      return a * (1 - Math.abs(2 * r-1-beta)/(1-beta));
    } else {
      return 0;
    }   
  }

fn fast_exp(x: f32) -> f32 {
  var t = 1.0 + x/32.0;
  t *= t; t *= t; t *= t; t *= t; t *= t; // t **= 32
  return t;

}

fn wrap(pos: vec2<f32>) -> vec2<f32> {
    return (fract(pos/p.world_extent+0.5)-0.5)*p.world_extent;
}


fn f_index(x: f32, y: f32) -> u32 {
    return u32(x * p.K + y);
}


@compute @workgroup_size(64)
fn update_velocities(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    var force_x: f32 = 0.0;
    var force_y: f32 = 0.0;
    for (var j: u32 = 0; j < arrayLength(&positions); j = j +1) {
        if (i == j) {continue;}
        var dpos: vec2<f32> = wrap(positions[j] - positions[i]);
        let r = length(dpos);
        if (r > 3.0) {continue;}
        dpos /= r+1e-8;
        let rep = max(1.0-r, 0.0)*p.repulsion;
        let f = F[f_index(colors[i],colors[j])];
        let att = 0.5*max(1.0-abs(r-2.0), 0.0); //f*max(1.0-abs(r-2.0), 0.0);
        let j_force_x: f32 = dpos.x * (att - rep);
        let j_force_y: f32 = dpos.y * (att - rep);
        force_x = force_x + j_force_x;
        force_y = force_y + j_force_y;
    }
    let dv_x = 0.1 * p.inertia *force_x* p.dt;
    let dv_y = 0.1 * p.inertia *force_y* p.dt;  //* force ; ??? Instal new GPU drivers ???
    
    velocities[i].x = velocities[i].x + dv_x;
    velocities[i].y = velocities[i].y + dv_y;
}


@compute @workgroup_size(64) 
fn update_positions(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    let col = colors[i];
    let f = F[f_index(col,col)];
    positions[i] += velocities[i] * p.dt;
    positions[i] = wrap(positions[i]);
}



  function updateParticles() {
    // update velocities
    for (let i = 0; i < n; i++) {
      let totalForce = 0.0;
      
      for (let j = 0; j < n; j++) {
        if (i == j) continue;
        let dr = positions[j] - positions[i];
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
        
        const r = sqrt(dx*dx + dy*dy + dz*dz);
        if (r > 0 && r < rMax) {
          const f = force(r / rMax, matrix[colors[i]][colors[j]]);
          totalForceX += f * dx / r;
          totalForceY += f * dy / r; 
          totalForceZ += f * dz / r;
        }
      }
      totalForceX *= rMax * 5;
      totalForceY *= rMax * 5;
      totalForceZ *= rMax * 5;

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
