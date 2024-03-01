struct Global {
    scale: vec2f,
    grid_width: f32,
    grid_height: f32,
};

@binding(0) @group(0) var<uniform> global: Global;
@binding(1) @group(0) var<storage, read_write> colors: array<vec4<f32>>;
@binding(2) @group(0) var<storage, read_write> current_state: array<atomic<u32>>; // Histogram with 24 bins of u32 numbers
@binding(3) @group(0) var<storage, read_write> next_state: array<atomic<u32>>; // Histogram with 24 bins of u32 numbers

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

fn ring(id: vec2u, radius: u32, c: u32)  {
    if c == 0 {
        return;
    }
    var x = id.x;
    var y = id.y;
    
    //  move radius times down left
    for (var i = 0u; i < radius; i = i + 1u) {
        let par = parity(vec2u(x, y)); 
        x = x - par;
        y = y - 1u;
    }
    var _token = c;
    var id_ = vec2u(x, y);
    for (var i = 0u; i < 6; i = i + 1u) {
        for (var j = 0u; j < radius; j = j + 1u) {
            if (_token <= 0) {
                break;
            }
            atomicAdd(&next_state[index(vec2u(id_))],c/6);
            atomicSub(&next_state[index(id.xy)], c/6);
            
            _token = _token - 1;
            id_ = neighbor(id_, directions[i]);
        }
    }
   
}
// spiral should call `fn ring` for each radius.
// But my browser crashes when I do that.
// So I just put the code of ring inside spiral.
fn spiral(id: vec2u, i_radius: u32, o_radius: u32) -> vec3<f32> {
    var sum = vec3f(0.0, 0.0, 0.0);
    for (var i = i_radius; i <= o_radius; i = i + 1u) {
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
                // colors[index(vec2u(id_))] = vec4<f32>(1.0/(0.5*f32(_radius)), 0.0, 0.5, 1.0);
                sum = sum + colors[index(vec2u(id_))].xyz;
                id_ = neighbor(id_, directions[k]);
            }
        }
    }
    return sum;
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
            let color = colors[index];
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


@compute @workgroup_size(1) 
fn main( @builtin(global_invocation_id) id: vec3<u32>) {
    // Verifying I can access atomic histgrams and colors per cell
    // atomicAdd(&current_state[index(id.xy)][0],1u);
    let c = atomicLoad(&current_state[index(id.xy)]);
    atomicStore(&next_state[index(id.xy)], c);
    
    ring(id.xy, 1, c);
    colors[index(id.xy)] = vec4<f32>(f32(c) / 6.0, f32(c) / 6.0, f32(c) / 6.0, 1.0);
}
