struct Global {
    scale: vec2f,
    grid_width: f32,
    grid_height: f32,
}

struct Vertex {
    position: vec2f,
}

struct VSOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
}

@group(0) @binding(0) var<storage, read> offsets: array<vec2f>;
@group(0) @binding(1) var<storage, read> colors: array<vec4f>;
@group(0) @binding(2) var<uniform> global: Global;
@group(0) @binding(3) var<storage, read> pos: array<Vertex>;

@vertex fn vs(
    @builtin(vertex_index) vertexIndex : u32, // each time we call the vertex shader, this will be 0, 1, 2
    @builtin(instance_index) instanceIndex : u32 // each time we call the vertex shader, this will be 0, 1, ... (kNumObjects - 1)
) -> VSOutput {

    let hex_offset = offsets[instanceIndex];
    let hex_color = colors[instanceIndex];

    var vsOut: VSOutput;
    vsOut.position = vec4f((pos[vertexIndex].position + 0.2) * global.scale + hex_offset * global.scale, 0.0, 1.0);
    vsOut.color = colors[instanceIndex];
        let left_hex = colors[instanceIndex - 1];
        let up_left_hex = colors[i32(instanceIndex) + i32(global.grid_width)];
        let up_right_hex = colors[i32(instanceIndex) + i32(global.grid_width + 1)];
        let right_hex = colors[i32(instanceIndex) + 1];
        let down_right_hex = colors[i32(instanceIndex) - i32(global.grid_width)];
        let down_left_hex = colors[i32(instanceIndex) - i32(global.grid_width - 1)];
        let sum = left_hex.r + up_left_hex.r + up_right_hex.r + right_hex.r + down_right_hex.r + down_left_hex.r;
        if (sum > 3) {
            vsOut.color = vec4f(hex_color.r - (0.1 * sum), 0.1,0.2, 1);
        }
        else {
            // colors[instanceIndex] = vec4f(hex_color.r + (0.1 * sum), 0.1, 1.0, 1);
            vsOut.color = vec4f(hex_color.r + (0.1 * sum), 0.1, 1.0, 1);
        }
    return vsOut;
}