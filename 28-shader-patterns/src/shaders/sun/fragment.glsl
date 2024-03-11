uniform float uTime;

varying vec2 vUv;

void main() {
    float x = -cos(uTime) * 0.5 + 0.5;
    float y = sin(uTime) * 0.5;


    float strength = distance(vUv, vec2(x, y));
    strength *= 4.0;

    float steps = 2.0;
    strength *= steps;
    strength = floor(strength);
    strength /= steps;

    vec3 colorRed = vec3(214, 140, 98) / 255.0;
    vec3 colorBlue = vec3(99, 119, 167) / 255.0;

    vec3 color = mix(colorRed, colorBlue, strength);

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
}