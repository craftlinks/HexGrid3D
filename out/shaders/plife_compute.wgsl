@binding(0) @group(0) var<storage, read_write> colors: array<f32>; 
@binding(1) @group(0) var<storage, read_write> velocities: array<vec2<f32>>;
@binding(2) @group(0) var<storage, read_write> positions: array<vec2<f32>>;
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
