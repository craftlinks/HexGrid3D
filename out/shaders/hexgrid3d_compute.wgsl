struct Global {
    scale: vec2f,
    grid_width: f32,
    grid_height: f32,
};

@binding(0) @group(0) var<uniform> global: Global;
@binding(1) @group(0) var<storage, read_write> colors: array<vec4<f32>>; 

override blockSize = 8;

fn countNeighbors(id: u32) -> f32 {
    return 0.0;
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
    let sum = countNeighbors(id.x);
    if id.x == 21 && id.y == 21 {
        let index = i(id.xy);
        colors[index] = vec4<f32>(1.0, 0.0, 1.0, 1.0);
        let par = parity(id.xy);
        if par == 0 {
            colors[index] = vec4<f32>(1.0, 0.0, 0.0, 1.0);
        }
        else {
            colors[index] = vec4<f32>(0.0, 1.0, 0.0, 1.0);
        }
        let l = i(vec2<u32>(id.x - 1, id.y));
        let r = i(vec2<u32>(id.x + 1, id.y));
        let ul = i(vec2<u32>(id.x - par, id.y + 1));
        let ur = i(vec2<u32>(id.x + 1 - par, id.y + 1));
        let ll = i(vec2<u32>(id.x - par, id.y - 1));
        let lr = i(vec2<u32>(id.x + 1 - par, id.y - 1));

        colors[l] = vec4<f32>(1.0 - f32(par), f32(par), 0.0, 1.0);
        colors[r] = vec4<f32>(1.0 - f32(par), f32(par), 0.0, 1.0);
        colors[ul] = vec4<f32>(1.0 - f32(par), f32(par), 0.0, 1.0);
        colors[ur] = vec4<f32>(1.0 - f32(par), f32(par), 0.0, 1.0);
        colors[ll] = vec4<f32>(1.0 - f32(par), f32(par), 0.0, 1.0);
        colors[lr] = vec4<f32>(1.0 - f32(par), f32(par), 0.0, 1.0);

    }
}
