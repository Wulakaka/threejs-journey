uniform float uDeltaTime;
uniform sampler2D uBase;
uniform vec3 uInteractivePoint;
uniform float uInteractiveRadius;
uniform float uInteractiveDecay;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particles = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);

    // 距离交互中心
    float distanceToInteractive = distance(uInteractivePoint, base.xyz);
    float d = 1.0 - step(uInteractiveRadius, distanceToInteractive);
    particles.a = max(d, particles.a);

    particles.a -= uDeltaTime * uInteractiveDecay;
    particles.a = max(particles.a, 0.0);

    gl_FragColor = particles;
}
