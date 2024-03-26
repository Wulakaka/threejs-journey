uniform float uTime;

varying vec3 vPosition;

void main() {
    float stripes = vPosition.y;

    //    形成条纹
    stripes = fract((stripes - uTime * 0.02) * 20.0);
    //    变化更锐利
    stripes = pow(stripes, 2.0);

    gl_FragColor = vec4(1.0, 1.0, 1.0, stripes);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}