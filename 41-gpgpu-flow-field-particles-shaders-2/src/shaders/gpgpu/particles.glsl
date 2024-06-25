
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 particles = texture(uParticles, uv);
    particles.y += 0.01;
    gl_FragColor = particles;
}
