uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    float stripes = vPosition.y;

    //    形成条纹
    stripes = fract((stripes - uTime * 0.02) * 20.0);
    //    变化更锐利
    stripes = pow(stripes, 2.0);


    // Normal
    // 归一化
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    // Fresnel
    // 如果法线和视线方向相同，fresnel = 1, 如果相反，fresnel = -1, 如果垂直，fresnel = 0
    // 范围为 -1 ~ 0
    float fresnel = dot(viewDirection, normal);
    fresnel += 1.0;
    fresnel = pow(fresnel, 4.0);


    float opacity = fresnel * stripes;
    gl_FragColor = vec4(1.0, 1.0, 1.0, opacity);
    //    gl_FragColor = vec4(viewDirection, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
