uniform float uTime;

varying vec2 vUv;

float rectangleStep(float width, float height, float left, float bottom) {
    return step(left, vUv.x) * (1.0 - step(left + width, vUv.x)) * step(bottom, vUv.y) * (1.0 - step(bottom + height, vUv.y));
}

float rectangleFloor(float size) {
    size = 1.0 - size;
    return floor(vUv.x + size) * floor(vUv.y + size) * floor(vUv.y - size) * floor(vUv.x - size);
}

void main() {

    float size = 0.2;
    float time = uTime * 0.5;
    float strength = rectangleStep(0.2, 0.3, mod(time, 1.0), mod(time, 1.0));
    //    float strength = rectangleStep(0.2, 0.3, 0.4, 0.2);
    vec3 color = vec3(strength);

    //    vec3 colorRed = vec3(214, 140, 98) / 255.0;
    //    vec3 colorBlue = vec3(99, 119, 167) / 255.0;
    //    color = mix(colorRed, colorBlue, strength);

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
}
