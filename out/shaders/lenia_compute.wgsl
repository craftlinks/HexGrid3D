
@binding(0) @group(0) var<storage, read_write> rval_buf: array<f32>;
@binding(1) @group(0) var<storage, read_write> uval_buf: array<f32>; 
@binding(2) @group(0) var<storage, read_write> rgrad_buf: array<vec2<f32>>;
@binding(3) @group(0) var<storage, read_write> ugrad_buf: array<vec2<f32>>;
@binding(4) @group(0) var<storage, read_write> positions: array<vec2<f32>>;

const c_rep = 1.0;
const mu_k = 80.0;
const sigma_k = 2.0;
const w_k = 0.22;
const mu_g = 0.1;
const sigma_g = 0.015;
const dt = 0.025;

struct Repulsion {
    rep: f32,
    rep_grad: f32,
}

struct Peak {
    y: f32,
    dy: f32,
}

fn repulsion_f(r:f32, c_rep: f32) -> Repulsion {
    let t = max(0.0, 1.0 - r);
    var repulsion: Repulsion;
    repulsion.rep = 0.5 * c_rep * t * t;
    repulsion.rep_grad = -c_rep * t;
    return repulsion;
}

fn peak_f(r: f32, mu: f32, sigma: f32, w: f32) -> Peak {
    let t = (r - mu) / sigma;
    let y = w / exp( t * t);
    let dy = -2.0 * t * y / sigma;
    var peak: Peak;
    peak.y = y;
    peak.dy = dy;
    return peak;
}

@compute @workgroup_size(64)
fn reset_buffers(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    rval_buf[i] = 0.0;
    uval_buf[i] = 0.0;
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

        var r = positions[i] - positions[j];
        let r2 = dot(r, r) + 1e-20;
        r /= r2;
    
        if (r2 < 1.0) {
            var repulsion = repulsion_f(r2, c_rep);
            rval_buf[i] += repulsion.rep;
           // rval_buf[j] += repulsion.rep;
            rgrad_buf[i] += r * repulsion.rep_grad;
            //rgrad_buf[j] -= r * repulsion.rep_grad;
        }
        var lenia_potential: Peak = peak_f(r2, mu_k, sigma_k, w_k);
        uval_buf[i] += lenia_potential.y;
        //uval_buf[j] += lenia_potential.y;
        ugrad_buf[i] += r * lenia_potential.dy;
       // ugrad_buf[j] -= r * lenia_potential.dy;
    }
}

@compute @workgroup_size(64) 
fn update_positions(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    let growth_potential: Peak = peak_f(uval_buf[i], mu_g, sigma_g, 1.0);
    let v = growth_potential.dy * ugrad_buf[i] - rgrad_buf[i];
    positions[i] += v * dt;
    var rval = rval_buf[i];
}
