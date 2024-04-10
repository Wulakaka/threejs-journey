uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl
#include ../includes/pointLight.glsl


void main()
{
    vec3 color = uColor;

    vec3 light = vec3(0.0);
    light += ambientLight(
        vec3(1.0),  // light color
        0.03        // light intensity
    );
    light += directionalLight(
        vec3(0.1, 0.1, 1.0),    // light color
        1.0,                    // light intensity
        vNormal,                // normal
        vec3(0.0, 0.0, 3.0),    // light position
        vPosition,              // position
        20.0                    // specular power
    );
    light += pointLight(
        vec3(1.0, 0.1, 0.1),    // light color
        1.0,                    // light intensity
        vNormal,                // normal
        vec3(0.0, 2.5, 0.0),    // light position
        vPosition,              // position
        20.0,                   // specular power
        0.1                     // light decay 光线衰减
    );
    light += pointLight(
    vec3(0.1, 1.0, 0.5),    // Light color
    1.0,                    // Light intensity,
    vNormal,                // Normal
    vec3(2.0, 2.0, 2.0),    // Light position
    vPosition,              // position
    20.0,                   // Specular power
    0.1                     // Light decay
    );

    color *= light;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
