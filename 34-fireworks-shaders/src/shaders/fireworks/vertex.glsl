attribute float aSize;

uniform float uSize;
uniform vec2 uResolution;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    gl_PointSize = uSize * uResolution.y * aSize;
    gl_PointSize *= 1.0 / -viewPosition.z;

}