struct Global {
    scale: vec2f,
    grid_width: f32,
    grid_height: f32,
};

@binding(0) @group(0) var<uniform> global: Global;
@binding(1) @group(0) var<storage, read> current_colors: array<vec4<f32>>;
@binding(2) @group(0) var<storage, read_write> next_colors: array<vec4<f32>>; 

override blockSize = 8;

const directions: array<vec2i, 6> = array<vec2i,6>(
    vec2i(1, 0), // R
    vec2i(1, 1), // UR
    vec2i(0, 1), // UL
    vec2i(-1, 0), // L
    vec2i(0, -1), // DL
    vec2i(1, -1) // DR
);

fn neighbor(id: vec2u, dir: vec2i) -> vec2u {
    let par = parity(id);
    if (dir.y == 0) {
        return vec2u(u32(i32(id.x) + dir.x), id.y);
    }
    else {
        return vec2u(u32(i32(id.x) + dir.x - i32(par)), u32(i32(id.y) + dir.y));
    }  
}


fn ring(id: vec2u, radius: u32)  {
    var x = id.x;
    var y = id.y;
    //  move radius times down left
    for (var i = 0u; i < radius; i = i + 1u) {
        let par = parity(vec2u(x, y)); 
        x = x - par;
        y = y - 1u;
    }
    var id_ = vec2u(x, y);
    for (var i = 0u; i < 6; i = i + 1u) {
        for (var j = 0u; j < radius; j = j + 1u) {
            next_colors[index(vec2u(id_))] = vec4<f32>(0.0, 0.0, 1.0, 1.0);
            id_ = neighbor(id_, directions[i]);
        }
    }
}
// spiral should call `fn ring` for each radius.
// But my browser crashes when I do that.
// So I just put the code of ring inside spiral.
fn spiral(id: vec2u, radius: u32)  {
    for (var i = 1u; i <= radius; i = i + 1u) {
        var x = id.x;
        var y = id.y;
        //  Move radius times down left
        let _radius = i;
        for (var j = 1u; j <= _radius; j = j + 1u) {
            let par = parity(vec2u(x, y)); 
            x = x - par;
            y = y - 1u;
        }
        var id_ = vec2u(x, y);
        // Ring
        for (var k = 0u; k < 6; k = k + 1u) {
            for (var l = 1u; l <= _radius; l = l + 1u) {
                next_colors[index(vec2u(id_))] = vec4<f32>(1.0/f32(_radius), 0.0, 1.0, 1.0);
                id_ = neighbor(id_, directions[k]);
            }
        }
    }
}

fn getNeigbors(id: vec2u) -> array<u32, 6> {
    let par = parity(id);
    let neighbors  = array<u32, 6>(
        index(vec2u(id.x - 1, id.y)),
        index(vec2u(id.x + 1, id.y)),
        index(vec2u(id.x - par, id.y + 1)),
        index(vec2u(id.x + 1 - par, id.y + 1)),
        index(vec2u(id.x - par, id.y - 1)),
        index(vec2u(id.x + 1 - par, id.y - 1))
    );
    return neighbors;
}

fn countNeighbors(id: vec2u) -> array<f32,3> {
    let neighbors = getNeigbors(id);
    var sum_r = 0.0;
    var sum_g = 0.0;
    var sum_b = 0.0;
    for (var i = 0u; i < 6; i = i + 1u) {
        let index = neighbors[i];
        
        if index < u32(global.grid_width * global.grid_height) {
            let color = current_colors[index];
            sum_r = sum_r + color.x;
            sum_g = sum_g + color.y;
            sum_b = sum_b + color.z;
        }
    }
    return array<f32,3>(sum_r, sum_g, sum_b);
}

fn index(id: vec2u) -> u32 {
    let x = (id.x + u32(global.grid_width)) % u32(global.grid_width);
    let y = (id.y + u32(global.grid_height)) % u32(global.grid_height);
    return y * u32(global.grid_width) + x;
}

fn parity(id: vec2u) -> u32 {
    return id.y & 1;
}

@compute @workgroup_size(16,16) 
fn main( @builtin(global_invocation_id) id: vec3<u32>) {
    let sum = countNeighbors(id.xy);
    // zero(sum, id.xy);
    if (id.x == u32(global.grid_width)/2 && id.y == u32(global.grid_height)/2) {
        spiral(id.xy, 3);
    }
    
    
}

fn zero(sum: array<f32,3>, id: vec2u) {
    if sum[0] + sum[1] + sum[2] < 3.8 && sum[0] + sum[1] + sum[2] > 2.0 {
        next_colors[index(id.xy)] = vec4<f32>(sum[0]/1.85, sum[1]/1.85, sum[2]/1.85, 1.0);
    }
    // else if sum[0] + sum[1] + sum[2] > 3.0 && sum[0] + sum[1] + sum[2] < 6.0{
    //     next_colors[i(id.xy)] = vec4<f32>(0.5, 1.0, 0.5, 1.0);
    // }
    // else if sum[0] + sum[1] + sum[2] == 6.0 {
    //    next_colors[i(id.xy)] = vec4<f32>(0.0, 0.0, 1.0, 1.0);
    // }
    // else if sum[0] + sum[1] + sum[2] == 4.0 {
    //     next_colors[i(id.xy)] = vec4<f32>(1.0, 0.0, 0.0, 1.0);
    // }
    // else if sum[0] + sum[1] + sum[2] == 5.0 {
    //     next_colors[i(id.xy)] = vec4<f32>(1.0, 1.0, 1.0, 1.0);
    // }
    // else if sum[0] + sum[1] + sum[2] == 6.0 {
    //    next_colors[i(id.xy)] = vec4<f32>(1.0, 1.0, 1.0, 1.0);
    // }
    else {
        next_colors[index(id.xy)] = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    }
}
