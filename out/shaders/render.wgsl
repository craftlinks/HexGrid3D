struct VertexUniforms {
    screenDimensions: vec2f,
    particleSize: f32,
    screenRatio: f32
};

struct VSOut {
    @builtin(position) clipPosition: vec4f,
    @location(0) color: vec4f
};

@group(0) @binding(0) var<uniform> vertexUniforms: VertexUniforms;

@vertex
fn vs(
    @location(0) vertexPosition: vec2f,
    @location(1) color: vec4f,
    @location(2) position: vec3f,
) -> VSOut {
    var vsOut: VSOut;
    var adjustedP = position;
    adjustedP.y *= vertexUniforms.screenRatio;
    vsOut.clipPosition = vec4f(vertexPosition * vertexUniforms.particleSize / vertexUniforms.screenDimensions + adjustedP.xy, adjustedP.z, 1.0);
    var normalizedColor = color;
    normalizedColor.w *= ((position.z * 0.5 ) + 0.5);
    vsOut.color = normalizedColor;

    return vsOut;
}             

@fragment 
fn fs(@location(0) color: vec4f) -> @location(0) vec4f {
    return vec4f(color.rgb * color.a * 1.5, color.a);
} 