uniform vec3 uColor;
uniform vec2 uResolution;
uniform float uShadowRepetitions;
uniform vec3 uShadowColor;
uniform vec3 uShadowDirection;
uniform float uLightRepetitions;
uniform vec3 uLightColor;
uniform vec3 uLightPosition;

varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl

vec3 halftone(
    vec3 color,
    float repetitions,
    vec3 direction,
    float low,
    float high,
    vec3 pointColor,
    vec3 normal
) {
    // 光源与法线的点积，如果方向和法线相同，点积为1，如果方向和法线垂直，点积为0
    float intensity = dot(normal, direction);
    // remap the intensity to the range 0.0 - 1.0
    intensity = smoothstep(low, high, intensity);

    vec2 uv = gl_FragCoord.xy / uResolution.y;
    uv = mod(uv * repetitions, 1.0);

    float point = distance(uv, vec2(0.5));
    point = 1.0 - step(0.5 * intensity, point);
    return mix(color, pointColor, point);
}


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
        uLightPosition, // Light position
        viewDirection,       // View direction
        1.0                  // Specular power
    );

    color *= light;

    // Halftone
    color = halftone(
        color,                 // Input color
        uShadowRepetitions,    // Repetitions
        normalize(uShadowDirection), // Direction
        - 0.8,                 // Low
        1.5,                   // High
        uShadowColor,   // Point color
        normal                 // Normal
    );

    color = halftone(
        color,                 // Input color
        uLightRepetitions,    // Repetitions
        normalize(uLightPosition), // Direction
        0.5,                 // Low
        1.5,                 // High
        uLightColor,   // Point color
        normal                 // Normal
    );


    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
