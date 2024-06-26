uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uBase;

#include ../includes/simplexNoise4d.glsl
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 particles = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);

    if(particles.a > 1.0) {
        particles.a = mod(particles.a, 1.0);
        particles.xyz = base.xyz;

    } else {
        vec3 flowField = vec3(
            simplexNoise4d(vec4(particles.xyz + 1.0, uTime)),
            simplexNoise4d(vec4(particles.xyz + 2.0, uTime)),
            simplexNoise4d(vec4(particles.xyz + 3.0, uTime))
        );

        flowField = normalize(flowField);
        particles.xyz += flowField * uDeltaTime * 0.5;
        particles.a += uDeltaTime * 0.3;
    }



    gl_FragColor = particles;
}
