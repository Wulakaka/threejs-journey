uniform float uDeltaTime;
uniform sampler2D uBase;
uniform vec3 uInteractivePoint;
uniform float uInteractiveRadius;
uniform float uInteractiveDecay;
uniform vec3 uCameraPosition;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particles = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);

    // 计算粒子与交互点的距离
    float distanceToInteractive = length(uInteractivePoint - uCameraPosition);
    // 如果两点重合则不更新 alpha
    if(distanceToInteractive > 0.0) {
        vec3 rayDirection = normalize(uInteractivePoint - uCameraPosition);
        vec3 particleDirection = base.xyz - uCameraPosition;
        // 计算粒子与交互射线的距离
        float distanceToDirection = length(cross(rayDirection, particleDirection));

        float strength = 1.0 - smoothstep(0.0, uInteractiveRadius, distanceToDirection);
        strength = pow(strength, 0.5);
        particles.a = max(strength, particles.a);
    }
    particles.a -= uDeltaTime * uInteractiveDecay;
    particles.a = max(particles.a, 0.0);

    gl_FragColor = particles;
}
