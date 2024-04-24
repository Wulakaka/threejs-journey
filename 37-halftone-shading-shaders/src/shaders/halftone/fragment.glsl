uniform vec3 uColor;
uniform vec2 uResolution;

varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl

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
    light += directionalLight(
    vec3(1.0, 1.0, 1.0), // Light color
    1.0,                 // Light intensity
    normal,              // Normal
    vec3(1.0, 1.0, 0.0), // Light position
    viewDirection,       // View direction
    1.0                  // Specular power
    );

    color *= light;

    // Halftone
    float repetitions = 30.0;
    vec3 direction = vec3(0.0, -1.0, 0.0);
    float low = - 0.8;
    float high = 1.5;
    vec3 pointColor = vec3(1.0, 0.0, 0.0);

    vec2 uv = gl_FragCoord.xy / uResolution.y;
    uv = mod(uv * repetitions, 1.0);

    // 光源与法线的点积，如果方向和法线相同，点积为1，如果方向和法线垂直，点积为0
    float intensity = dot(normal, direction);
    // remap the intensity to the range 0.0 - 1.0
    intensity = smoothstep(low, high, intensity);

    float point = distance(uv, vec2(0.5));
    point = 1.0 - step(0.5 * intensity, point);
    pointColor = mix(color,pointColor, point);


    // Final color
    gl_FragColor = vec4(pointColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
