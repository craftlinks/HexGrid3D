struct Global {
    scale: vec2f,
    grid_width: f32,
    grid_height: f32,
};

@binding(0) @group(0) var<uniform> global: Global;
@binding(1) @group(0) var<storage, read_write> colors: array<vec4<f32>>; 

override blockSize = 8;

fn countNeighbors(id: u32) -> f32 {
    let hex = colors[id];
   
    let left_hex = colors[id - 1];
    let up_left_hex = colors[i32(id) + i32(global.grid_width)];
    let up_right_hex = colors[i32(id) + i32(global.grid_width + 1)];
    let right_hex = colors[i32(id) + 1];
    let down_right_hex = colors[i32(id) - i32(global.grid_width)];
    let down_left_hex = colors[i32(id) - i32(global.grid_width + 1)];
    let sum: f32 = left_hex.r + up_left_hex.r + up_right_hex.r + right_hex.r + down_right_hex.r + down_left_hex.r;
    
    return sum; 
}

@compute @workgroup_size(1) 
fn main( @builtin(global_invocation_id) id: vec3<u32>) {
    let sum = countNeighbors(id.x);
    let left = id.x - 1;
    let right = id.x + 1;
    let up_left_hex = id.x + u32(global.grid_width - 1);
    let up_right_hex = id.x + u32(global.grid_width);
    let down_right_hex = id.x - u32(global.grid_width);
    let down_left_hex = id.x - u32(global.grid_width + 1);
    if id.x == 51 {
        colors[left] = vec4<f32>(0.0, 1.0, 0.0, 1.0);
        colors[right] = vec4<f32>(0.0, 1.0, 0.0, 1.0);
        colors[up_left_hex] = vec4<f32>(0.0, 0.0, 1.0, 1.0);
        colors[up_right_hex] = vec4<f32>(0.0, 0.0, 1.0, 1.0);
        colors[down_right_hex] = vec4<f32>(0.0, 1.0, 1.0, 1.0);
        colors[down_left_hex] = vec4<f32>(0.0, 1.0, 1.0, 1.0);


    }
}
