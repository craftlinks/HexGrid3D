# HexGrid3D
A 3D Hex Grid with WebGPU 

bun build ./src/index.ts --outdir ./out --minify-whitespace --minify-identifiers --minify-syntax --watch


# GPU Specifications

## GPU Supported Limits:

maxTextureDimension1D: 16384
maxTextureDimension2D: 16384
maxTextureDimension3D: 2048
maxTextureArrayLayers: 2048
maxBindGroups: 4
maxBindGroupsPlusVertexBuffers: 24
maxBindingsPerBindGroup: 1000
maxDynamicUniformBuffersPerPipelineLayout: 10
maxDynamicStorageBuffersPerPipelineLayout: 8
maxSampledTexturesPerShaderStage: 16
maxSamplersPerShaderStage: 16
maxStorageBuffersPerShaderStage: 10
maxStorageTexturesPerShaderStage: 8
maxUniformBuffersPerShaderStage: 12
maxUniformBufferBindingSize: 65536
maxStorageBufferBindingSize: 2147483644
minUniformBufferOffsetAlignment: 256
minStorageBufferOffsetAlignment: 256
maxVertexBuffers: 8
maxBufferSize: 2147483648
maxVertexAttributes: 30
maxVertexBufferArrayStride: 2048
maxInterStageShaderComponents: 112
maxInterStageShaderVariables: 28
maxColorAttachments: 8
maxColorAttachmentBytesPerSample: 128
maxComputeWorkgroupStorageSize: 32768
maxComputeInvocationsPerWorkgroup: 1024
maxComputeWorkgroupSizeX: 1024
maxComputeWorkgroupSizeY: 1024
maxComputeWorkgroupSizeZ: 64
maxComputeWorkgroupsPerDimension: 65535

## GPU Supported Features:

indirect-first-instance
depth32float-stencil8
depth-clip-control
shader-f16
timestamp-query
float32-filterable
texture-compression-bc
rg11b10ufloat-renderable
bgra8unorm-storage