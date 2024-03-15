
@binding(0) @group(0) var<storage, read_write> rval_buf: array<f32>;
@binding(1) @group(0) var<storage, read_write> uval_buf: array<f32>; 
@binding(2) @group(0) var<storage, read_write> rgrad_buf: array<f32>;
@binding(3) @group(0) var<storage, read_write> ugrad_buf: array<f32>;
@binding(4) @group(0) var<storage, read_write> positions: array<vec2<f32>>;

@compute @workgroup_size(64) 
fn compute_fields( @builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    var rval = rval_buf[i];
    var uval = uval_buf[i];
    var rgrad = rgrad_buf[i];
    var ugrad = ugrad_buf[i];
    var pos = positions[i];
    // do something with the fields
    // ...
    // write back the results
    rval_buf[i] = rval;
    uval_buf[i] = uval;
    rgrad_buf[i] = rgrad;
    ugrad_buf[i] = ugrad;
}

@compute @workgroup_size(64) 
fn update_positions(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    var rval = rval_buf[i];
    var uval = uval_buf[i];
    var rgrad = rgrad_buf[i];
    var ugrad = ugrad_buf[i];
    var pos_x = positions[i].x;
    var pos_y = positions[i].y;
    // do something with the positions
    pos_x += 0.005;
    pos_y += -0.005;
    // write back the results
    positions[i].x = pos_x;
    positions[i].y = pos_y;
}
