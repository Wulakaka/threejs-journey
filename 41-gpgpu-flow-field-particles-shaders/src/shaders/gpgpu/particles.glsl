void main() {
    // gl_FragCoord 是一个内建变量，它包含了当前片元的屏幕坐标
    // 左下角为 (0.0, 0.0)，右上角为 (gpgpu.size,gpgpu.size)
    // resolution 是一个内建变量，它包含了当前画布的分辨率
    // 最终的 uv 左下角为 (0.0, 0.0)，右上角为 (1.0, 1.0)
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particles = texture(uParticles, uv);
    gl_FragColor = particles;
}
