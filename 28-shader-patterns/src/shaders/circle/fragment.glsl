uniform float uTime;

varying vec2 vUv;

// 利用 smoothstep 将边缘变得更加平滑
float circle(in vec2 _st, in float _radius) {
    vec2 dist = _st - vec2(0.5);
    return 1. - smoothstep(_radius - (_radius * 0.01),
                           _radius + (_radius * 0.01),
                           sqrt(dot(dist, dist) * 4.0));
}

void main() {

    float strength = distance(vUv, vec2(0.5));
    strength = circle(vUv, .1);

    vec3 color = vec3(strength);
    //
    //        vec3 colorRed = vec3(214, 140, 98) / 255.0;
    //        vec3 colorBlue = vec3(99, 119, 167) / 255.0;
    //        color = mix(colorRed, colorBlue, strength);

    gl_FragColor = vec4(color, 1.0);

    //    #include <colorspace_fragment>
}
