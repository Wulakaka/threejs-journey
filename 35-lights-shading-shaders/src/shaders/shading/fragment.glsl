uniform vec3 uColor;
varying vec3 vNormal;

#include ../includes/ambientLight.glsl


vec3 directionalLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightDirection) {
    normal = normalize(normal);
    lightDirection = normalize(lightDirection);
    // shading
    float shading = dot(normal, lightDirection);
    shading = max(shading, 0.0);

    return lightColor * lightIntensity * shading;
}


void main()
{
    vec3 color = uColor;

    vec3 light = vec3(0.0);
    light += ambientLight(vec3(1.0), 0.03);
    light += directionalLight(vec3(0.1, 0.1, 1.0), 1.0, vNormal, vec3(0.0, 0.0, 3.0));

    color *= light;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
