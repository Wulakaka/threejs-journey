uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    float stripes = vPosition.y;

    vec3 normal = normalize(vNormal);

    //    形成条纹
    stripes = fract((stripes - uTime * 0.02) * 20.0);
    //    变化更锐利
    stripes = pow(stripes, 2.0);

    // Fresnel
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Holographic
    float holographic = stripes * fresnel;
    holographic += 1.25 * fresnel;

    gl_FragColor = vec4(1.0, 1.0, 1.0, holographic);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
