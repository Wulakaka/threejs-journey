uniform vec3 uColor;

#include ../includes/ambientLight.glsl
void main()
{
    vec3 color = uColor;

    vec3 light = vec3(0.0);
    light += ambientLight(vec3(1.0), 0.5);

    color *= light;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
