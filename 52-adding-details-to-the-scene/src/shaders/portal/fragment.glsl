uniform float uTime;
uniform vec3 uColorStart;
uniform vec3 uColorEnd;

varying vec2 vUv;

#include ../includes/cnoise.glsl

void main() {
    // Displace the UV
    vec2 displacedUv = vUv + cnoise(vec3(vUv * 4.0, uTime * 0.1));
    // Perlin noise
    float strength = cnoise(vec3(displacedUv * 5.0, uTime * 0.2));

    // outer glow
    float distanceToCenter = distance(vUv, vec2(0.5));

    float outerGlow = pow(distanceToCenter * 2.2, 3.0);
    strength += outerGlow;

    // Apply cool step
    strength += step(-0.5, strength) * 0.2 + step(0.5, strength) * 0.8;

    strength = clamp(strength, 0.0, 1.0);

    vec3 color = mix(uColorStart, uColorEnd, strength);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
}
