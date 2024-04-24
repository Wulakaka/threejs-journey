uniform vec3 uColor;

varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight.glsl

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = uColor;

    // Lights
    vec3 light = vec3(0.0);
    light += ambientLight(
        vec3(1.0), // 白光
        1.0
    );

    color *= light;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
