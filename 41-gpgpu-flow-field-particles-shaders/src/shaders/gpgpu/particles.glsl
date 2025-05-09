uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uBase;
uniform float uFlowFieldInfluence;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;

#include ../includes/simplexNoise4d.glsl

void main() {
    // gl_FragCoord 是一个内建变量，它包含了当前片元的屏幕坐标
    // 左下角为 (0.0, 0.0)，右上角为 (gpgpu.size,gpgpu.size)
    // resolution 是一个内建变量，它包含了当前画布的分辨率
    // 最终的 uv 左下角为 (0.0, 0.0)，右上角为 (1.0, 1.0)
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);

    // Dead
    if(particle.a > 1.0) {
        // 当帧率很低的时候，一次性加过来的值可能是个较大值，如果赋值为 0，会看到闪烁
        particle.a = mod(particle.a, 1.0);
        // 重置为初始位置
        particle.xyz = base.xyz;
    }
    // Alive
    else {
        float time = uTime * 0.2;

        // Strength
        // 乘以 0.2 为了让受影响的区域变小
        float strength = simplexNoise4d(vec4(base.xyz * 0.2, time + 1.0));
        // Influence
        float influence = (uFlowFieldInfluence - 0.5) * -2.0;
        strength = smoothstep(influence, 1.0, strength);

        vec3 flowField = vec3(
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 1.0, time)),
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 2.0, time)),
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 3.0, time))
        );
        // 归一化让 flowfield 表示为方向
        flowField = normalize(flowField);
        // 后面乘以的值是 flowField 游离的偏移
        particle.xyz += flowField * uDeltaTime * strength * uFlowFieldStrength;

        // Decay
        particle.a += uDeltaTime * 0.3;
    }


    gl_FragColor = particle;
}
