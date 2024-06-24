uniform sampler2D uBase;

#include ../includes/simplexNoise4d.glsl

void main() {


    // gl_FragCoord 是一个内建变量，它包含了当前片元的屏幕坐标
    // 左下角为 (0.0, 0.0)，右上角为 (gpgpu.size,gpgpu.size)
    // resolution 是一个内建变量，它包含了当前画布的分辨率
    // 最终的 uv 左下角为 (0.0, 0.0)，右上角为 (1.0, 1.0)
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particles = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);

    // Dead
    if(particles.a > 1.0) {
        particles.a = 0.0;
        particles.xyz = base.xyz;
    }
    // Alive
    else {
        vec3 flowField = vec3(
            simplexNoise4d(vec4(particles.xyz + 1.0, 1.0)),
            simplexNoise4d(vec4(particles.xyz + 2.0, 1.0)),
            simplexNoise4d(vec4(particles.xyz + 3.0, 1.0))
        );

        particles.xyz += flowField * 0.01;
        particles.a += 0.01;
    }


    gl_FragColor = particles;
}
