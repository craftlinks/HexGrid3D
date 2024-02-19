struct Global {
    scale: f32,
    grid_width: f32,
    grid_height: f32,
};

@binding(0) @group(0) var<uniform> global: Global;
@binding(1) @group(0) var<storage, read_write> colors: array<vec4<f32>>; 

override blockSize = 8;

fn countNeighbors(id: u32) -> vec3f {
    let left_hex = colors[id - 1];
    let up_left_hex = colors[i32(id) + i32(global.grid_width)];
    let up_right_hex = colors[i32(id) + i32(global.grid_width + 1)];
    let right_hex = colors[i32(id) + 1];
    let down_right_hex = colors[i32(id) - i32(global.grid_width)];
    let down_left_hex = colors[i32(id) - i32(global.grid_width - 1)];
    let sum_r = left_hex.r + up_left_hex.r + up_right_hex.r + right_hex.r + down_right_hex.r + down_left_hex.r;
    let sum_g = left_hex.g + up_left_hex.g + up_right_hex.g + right_hex.g + down_right_hex.g + down_left_hex.g;
    let sum_b = left_hex.b + up_left_hex.b + up_right_hex.b + right_hex.b + down_right_hex.b + down_left_hex.b;
    return vec3f(sum_r, sum_g, sum_b);
}

@compute @workgroup_size(blockSize) 
fn main( @builtin(global_invocation_id) id: vec3<u32>) {
    let sum = countNeighbors(id.x);
    if (sum[0] + sum[1] + sum[2]  > 0.6) {
        colors[id.x] = vec4f(colors[id.x].r - (0.002 * sum[0] + 0.001), colors[id.x].g + (0.001 * sum[0] + 0.001),colors[id.x].b + (0.001 * sum[0] + 0.001), 1);

    }
    else {
        colors[id.x] = vec4f(colors[id.x].r + (0.002 * sum[0] + 0.001), colors[id.x].g - (0.001 * sum[0] + 0.001),colors[id.x].b - (0.001 * sum[0] + 0.001), 1);
    }

    if (sum[1] > 2) {
        colors[id.x] = vec4f(colors[id.x].r + (0.001 * sum[1] + 0.001), colors[id.x].g - (0.002 * sum[1] + 0.001),colors[id.x].b + (0.001 * sum[1] + 0.001), 1);
    }
    else {
        colors[id.x] = vec4f(colors[id.x].r - (0.001 * sum[1] + 0.001), colors[id.x].g + (0.002 * sum[1] + 0.001),colors[id.x].b - (0.001 * sum[1] + 0.001), 1);
    }

    if (sum[2] > 2) {
        colors[id.x] = vec4f(colors[id.x].r + (0.001 * sum[1] + 0.001), colors[id.x].g + (0.001 * sum[1] + 0.001) ,colors[id.x].b - (0.002 * sum[2] + 0.001), 1);
    }
    else {
        colors[id.x] = vec4f(colors[id.x].r - (0.001 * sum[1] + 0.001), colors[id.x].g - (0.001 * sum[1] + 0.001) ,colors[id.x].b + (0.002 * sum[2] + 0.001), 1);
    }
}