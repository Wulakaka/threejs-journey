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

    // 距离交互中心
    vec3 rayDirection = normalize(uInteractivePoint - uCameraPosition);
    vec3 particleDirection = normalize(base.xyz - uCameraPosition);
    float angle = dot(rayDirection, particleDirection);
    angle = acos(angle);
    float distanceToDirection = sin(angle) * length(base.xyz - uCameraPosition);

    float strength = 1.0 - smoothstep(0.0, uInteractiveRadius, distanceToDirection);
    strength = pow(strength, 0.5);
    particles.a = max(strength, particles.a);

    particles.a -= uDeltaTime * uInteractiveDecay;
    particles.a = max(particles.a, 0.0);

    gl_FragColor = particles;
}
