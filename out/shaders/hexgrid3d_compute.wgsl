struct Global {
    scale: vec2f,
    grid_width: f32,
    grid_height: f32,
};

@binding(0) @group(0) var<uniform> global: Global;
@binding(1) @group(0) var<storage, read_write> colors: array<vec4<f32>>; 

override blockSize = 8;

fn getNeigbors(id: vec2u) -> array<u32, 6> {
    let par = parity(id);
    let neighbors  = array<u32, 6>(
        i(vec2u(id.x - 1, id.y)),
        i(vec2u(id.x + 1, id.y)),
        i(vec2u(id.x - par, id.y + 1)),
        i(vec2u(id.x + 1 - par, id.y + 1)),
        i(vec2u(id.x - par, id.y - 1)),
        i(vec2u(id.x + 1 - par, id.y - 1))
    );
    return neighbors;
}

fn countNeighbors(id: vec2u) -> f32 {
    let neighbors = getNeigbors(id);
    var sum = 0.0;
    for (var i = 0u; i < 6; i = i + 1u) {
        let index = neighbors[i];
        
        if index < u32(global.grid_width * global.grid_height) {
            let color = colors[index];
            sum = sum + color.x;
        }
    }
    return sum;
}

fn i(id: vec2u) -> u32 {
    let x = (id.x + u32(global.grid_width)) % u32(global.grid_width);
    let y = (id.y + u32(global.grid_height)) % u32(global.grid_height);
    return y * u32(global.grid_width) + x;
}

fn parity(id: vec2u) -> u32 {
    return id.y & 1;
}

@compute @workgroup_size(1) 
fn main( @builtin(global_invocation_id) id: vec3<u32>) {
    let sum = countNeighbors(id.xy);
    if sum == 1.0 {
        colors[i(id.xy)] = vec4<f32>(1.0, 0.0, 0.0, 1.0);
    }
    else if sum == 2.0 {
        colors[i(id.xy)] = vec4<f32>(0.0, 1.0, 0.0, 1.0);
    }
    else if sum == 3.0 {
        colors[i(id.xy)] = vec4<f32>(0.0, 0.0, 1.0, 1.0);
    }
    else {
        colors[i(id.xy)] = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    }
}
