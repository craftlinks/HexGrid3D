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
    return vsOut;
}