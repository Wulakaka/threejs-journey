uniform float uTime;

varying vec2 vUv;

#include ../includes/cnoise.glsl

void main() {
    // Displace the UV
    vec2 displacedUv = vUv + cnoise(vec3(vUv * 5.0, uTime * 0.1));
    // Perlin noise
    float strength = cnoise(vec3(displacedUv * 5.0, uTime * 0.2));

    gl_FragColor = vec4(vec3(strength), 1.0);
    #include <colorspace_fragment>
}
