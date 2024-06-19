uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;

attribute vec3 aTargetPosition;

void main()
{
    float progress = uProgress;
    vec3 newPosition = mix(position, aTargetPosition, progress);

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);
}
