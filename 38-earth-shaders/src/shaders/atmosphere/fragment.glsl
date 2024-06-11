varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // sun orientation
    float sunOrientation = dot(normal, uSunDirection);


    // Atmosphere
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    // 先显示大气颜色
    color += atmosphereColor;

    // alpha 的值应该在越贴近地表的时候越强，越靠近外层空间越弱，也就是 1 - 0 的过程
    // 这个过程跟之前的 fresnel 很像
    float edgeAlpha = dot(viewDirection, normal);
    // 使用 smoothstep 函数，让 alpha 值在 0.0 到 0.5 之间变成 0 - 1，超过 0.5 之后变成 1
    edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);

    // 使用 smoothstep 函数，让 alpha 值在 -0.5 到 0 之间变成 0 - 1，也就是让光延伸到照不到的一部分
    float dayAlpha = smoothstep(- 0.5, 0.0, sunOrientation);

    // Final color
    // 控制透明度，避免背景非黑色情况下颜色颜色不正常
    gl_FragColor = vec4(color, dayAlpha * edgeAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
