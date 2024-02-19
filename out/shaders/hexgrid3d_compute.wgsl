struct Global {
    scale: f32,
    grid_width: f32,
    grid_height: f32,
};

@binding(0) @group(0) var<uniform> global: Global;
@binding(1) @group(0) var<storage, read_write> colors: array<vec4<f32>>; 

override blockSize = 8;

fn countNeighbors(id: u32) -> vec3f {
    let hex = colors[id];
   
    let left_hex = colors[id - 1];
    let up_left_hex = colors[i32(id) + i32(global.grid_width)];
    let up_right_hex = colors[i32(id) + i32(global.grid_width + 1)];
    let right_hex = colors[i32(id) + 1];
    let down_right_hex = colors[i32(id) - i32(global.grid_width)];
    let down_left_hex = colors[i32(id) - i32(global.grid_width - 1)];

    let max_hex_r =  max(max(max(max(max(left_hex.r, up_left_hex.r), up_right_hex.r), right_hex.r), down_right_hex.r), down_left_hex.r);
    let max_hex_g =  max(max(max(max(max(left_hex.g, up_left_hex.g), up_right_hex.g), right_hex.g), down_right_hex.g), down_left_hex.g);
    let max_hex_b =  max(max(max(max(max(left_hex.b, up_left_hex.b), up_right_hex.b), right_hex.b), down_right_hex.b), down_left_hex.b);
    let min_hex_r =  min(min(min(min(min(left_hex.r, up_left_hex.r), up_right_hex.r), right_hex.r), down_right_hex.r), down_left_hex.r);
    let min_hex_g =  min(min(min(min(min(left_hex.g, up_left_hex.g), up_right_hex.g), right_hex.g), down_right_hex.g), down_left_hex.g);
    let min_hex_b =  min(min(min(min(min(left_hex.b, up_left_hex.b), up_right_hex.b), right_hex.b), down_right_hex.b), down_left_hex.b);
    let sum_hex_r = left_hex.r + up_left_hex.r + up_right_hex.r + right_hex.r + down_right_hex.r + down_left_hex.r;
    let sum_hex_g = left_hex.g + up_left_hex.g + up_right_hex.g + right_hex.g + down_right_hex.g + down_left_hex.g;
    let sum_hex_b = left_hex.b + up_left_hex.b + up_right_hex.b + right_hex.b + down_right_hex.b + down_left_hex.b;
    let avg_hex_r = sum_hex_r / 6;
    let avg_hex_g = sum_hex_g / 6;
    let avg_hex_b = sum_hex_b / 6;
    let diff_hex_r = max_hex_r - min_hex_r;
    let diff_hex_g = max_hex_g - min_hex_g;
    let diff_hex_b = max_hex_b - min_hex_b;
    let diff_avg_hex_r = max_hex_r - avg_hex_r;
    let diff_avg_hex_g = max_hex_g - avg_hex_g;
    let diff_avg_hex_b = max_hex_b - avg_hex_b;
    let sum_diff_hex = diff_hex_r + diff_hex_g + diff_hex_b;
    let sum_diff_avg_hex = diff_avg_hex_r + diff_avg_hex_g + diff_avg_hex_b;
    let sum_diff = sum_diff_hex + sum_diff_avg_hex;
    let sum = vec3f(avg_hex_r, avg_hex_g, avg_hex_b);
    return sum;
}

@compute @workgroup_size(blockSize) 
fn main( @builtin(global_invocation_id) id: vec3<u32>) {
    let sum = countNeighbors(id.x);
    let hex = colors[id.x];
    var new_hex = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    if sum.z > sum.y || sum.z < sum.x {
        if sum.x > 0.75 {
            new_hex.r = hex.r * 0.99;
        } else {
            new_hex.r = hex.r + 0.005;
        }
        if sum.y > 0.75 {
            new_hex.g = hex.g * 0.99;
        } else {
            new_hex.g = hex.g + 0.001;
        }
        if sum.x > 0.75 {
            new_hex.b = hex.b * 0.99;
        } else {
            new_hex.b = hex.b + 0.001;
        }
    }
    else if sum.z < sum.y || sum.z > sum.x {
        if sum.x < 0.25 {
            new_hex.r = hex.r + 0.001;
        } else {
            new_hex.r = hex.r * 0.99;
        }
        if sum.y < 0.25 {
            new_hex.g = hex.g + 0.001;
        } else {
            new_hex.g = hex.g * 0.99;
        }
        if sum.z < 0.25 {
            new_hex.b = hex.b + 0.001;
        } else {
            new_hex.b = hex.b * 0.99;
        }
    }
    if sum.x == 0.0 && sum.y == 0.0 && sum.z == 0.0 {
        new_hex.r = 0.3;
        new_hex.g = 0.5;
        new_hex.b = 0.7;
    }
    if sum.x == 1.0 && sum.y == 1.0 && sum.z == 1.0 {
        new_hex.r = 0.8;
        new_hex.g = 0.5;
        new_hex.b = 0.3;
    }
    if new_hex.r < 0.0 {
        new_hex.r = 0.0;
    }
    if new_hex.g < 0.0 {
        new_hex.g = 0.0;
    }
    if new_hex.b < 0.0 {
        new_hex.b = 0.0;
    }
    if new_hex.r > 1.0 {
        new_hex.r = 1.0;
    }
    if new_hex.g > 1.0 {
        new_hex.g = 1.0;
    }
    if new_hex.b > 1.0 {
        new_hex.b = 1.0;
    }
    colors[id.x] = new_hex;
}
