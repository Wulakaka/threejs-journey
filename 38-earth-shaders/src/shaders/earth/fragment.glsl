varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(vUv, 1.0);

    // sun orientation
    float sunOrientation = dot(normal, uSunDirection);

    // day/night color
    float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
    vec3 dayColor = texture(uDayTexture, vUv).rgb;
    vec3 nightColor = texture(uNightTexture, vUv).rgb;
    color = mix(nightColor, dayColor, dayMix);

    // clouds
    vec3 specularCloudColor = texture(uSpecularCloudsTexture, vUv).rgb;
    float cloudsMix = specularCloudColor.g;
    cloudsMix = smoothstep(0.5, 1.0, cloudsMix);
    color = mix(color, vec3(dayMix), cloudsMix);

    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Atmosphere
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    // 乘以 atmosphereDayMix 使得在夜晚不显示大气层
    color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);

    // Specular 镜面反射
    // 反射向量
    vec3 reflection = reflect(-uSunDirection, normal);
    // 与viewDirection 的点乘得出镜面反射的强度
    float specular = dot(-reflection, viewDirection);
    specular = max(specular, 0.0);
    // 让反射区域变小
    specular = pow(specular, 32.0);
    // 乘以 specularCloudColor.r 使得在陆地区域不反射
    specular *= specularCloudColor.r;
    // 在边缘处使用 atmosphere 的颜色
    // 先使用 mix 让中心变成白色，边缘处变成大气层颜色，fresnel 的效果就是中间黑，边缘强
    vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
    // 最后乘以 specular 让反射区域在中间时显示白色，在边缘时显示大气层颜色
    // 此时的 specular 作为一个强度值，类似于蒙版
    color += specular * specularColor;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
