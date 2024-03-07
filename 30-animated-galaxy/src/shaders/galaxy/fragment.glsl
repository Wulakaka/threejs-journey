varying vec3 vColor;

void main() {
    float strength = distance(gl_PointCoord, vec2(0.5)) * 2.0;
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);

    // 通过 mix 将颜色 和 pattern 混合
    vec3 color = mix(vec3(0.0), vColor, strength);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
}
