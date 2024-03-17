
@binding(0) @group(0) var<storage, read_write> rval_buf: array<f32>;
@binding(1) @group(0) var<storage, read_write> uval_buf: array<f32>; 
@binding(2) @group(0) var<storage, read_write> rgrad_buf: array<vec2<f32>>;
@binding(3) @group(0) var<storage, read_write> ugrad_buf: array<vec2<f32>>;
@binding(4) @group(0) var<storage, read_write> positions: array<vec2<f32>>;

struct Params {
    mu_k: f32,
    sigma_k: f32,
    w_k: f32,
    mu_g: f32,
    sigma_g: f32,
    c_rep: f32,
    dt: f32,
}

@binding(0) @group(1) var<uniform> p: Params;

struct Repulsion {
    rep: f32,
    rep_grad: f32,
}

struct Peak {
    y: f32,
    dy: f32,
}

fn repulsion_f(r:f32, c_rep: f32) -> Repulsion {
    let t = max(1.0 - r, 0.0 );
    var repulsion: Repulsion;
    repulsion.rep = 0.5 * c_rep * t * t;
    repulsion.rep_grad = -c_rep * t;
    return repulsion;
}

fn fast_exp(x: f32) -> f32 {
  var t = 1.0 + x/32.0;
  t *= t; t *= t; t *= t; t *= t; t *= t; // t **= 32
  return t;
}

fn peak_f(r: f32, mu: f32, sigma: f32, w: f32) -> Peak {
    let t = (r - mu) / sigma;
    let y = w / fast_exp( t * t);
    let dy = -2.0 * t * y / sigma;
    var peak: Peak;
    peak.y = y;
    peak.dy = dy;
    return peak;
}

@compute @workgroup_size(64)
fn reset_buffers(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    rval_buf[i] = repulsion_f(0.0 , p.c_rep).rep;
    uval_buf[i] = peak_f(0.0, p.mu_k, p.sigma_k, p.w_k).y;
    rgrad_buf[i] = vec2<f32>(0.0, 0.0);
    ugrad_buf[i] = vec2<f32>(0.0, 0.0);
    let pos = positions[i];
}

@compute @workgroup_size(64) 
fn compute_fields( @builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    
    if (i >= arrayLength(&positions)) {
        return;
    }

    for (var j: u32 = 0; j < arrayLength(&positions); j += 1) {
        if (i == j) {
            continue;
        }

        var r: vec2<f32> = positions[i] - positions[j];
        let r2: f32 = sqrt(dot(r, r)) + 1e-10;
        r.x /= r2;
        r.y /= r2;
    
        //if (r2 < 1.0) {
            var repulsion: Repulsion = repulsion_f(r2, p.c_rep);
            rval_buf[i] += repulsion.rep;
            rgrad_buf[i].x += r.x * repulsion.rep_grad;
            rgrad_buf[i].y += r.y * repulsion.rep_grad;
        //}
        var lenia_potential: Peak = peak_f(r2, p.mu_k, p.sigma_k, p.w_k);
        uval_buf[i] += lenia_potential.y;
        ugrad_buf[i].x += r.x * lenia_potential.dy;
        ugrad_buf[i].y += r.y * lenia_potential.dy;
    }
}

@compute @workgroup_size(64) 
fn update_positions(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    let growth_potential: Peak = peak_f(uval_buf[i], p.mu_g, p.sigma_g, 1.0);
    let vx = growth_potential.dy * ugrad_buf[i].x - rgrad_buf[i].x;
    let vy = growth_potential.dy * ugrad_buf[i].y - rgrad_buf[i].y;
    positions[i].x += vx * p.dt;
    positions[i].y += vy * p.dt;
    var rval = rval_buf[i];
}
