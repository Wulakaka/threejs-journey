uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uBase;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;
uniform float uFlowFieldInfluence;

#include ../includes/simplexNoise4d.glsl
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    // 降低了时间的速度
    float time = uTime * 0.2;
    vec4 particles = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);

    if(particles.a > 1.0) {
        particles.a = mod(particles.a, 1.0);
        particles.xyz = base.xyz;

    } else {

        // 根据时间的不同，每个点移动的速度会有变化
        float strength = simplexNoise4d(vec4(base.xyz, time + 1.0));
        // 让某些点不发生位置变化
        float influence = (uFlowFieldInfluence - 0.5) * -2.0;
        strength = smoothstep(influence, 1.0, strength);

        vec3 flowField = vec3(
            simplexNoise4d(vec4(particles.xyz * uFlowFieldFrequency + 1.0, time)),
            simplexNoise4d(vec4(particles.xyz * uFlowFieldFrequency + 2.0, time)),
            simplexNoise4d(vec4(particles.xyz * uFlowFieldFrequency + 3.0, time))
        );

        flowField = normalize(flowField);
        particles.xyz += flowField * strength * uDeltaTime * uFlowFieldStrength;

        // Decay 生命周期消亡
        particles.a += uDeltaTime * 0.3;
    }



    gl_FragColor = particles;
}
