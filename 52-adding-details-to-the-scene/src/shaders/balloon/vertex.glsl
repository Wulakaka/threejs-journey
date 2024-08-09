attribute vec3 aPositionA;

uniform float uPixelRatio;
uniform float uProgress;
uniform float uTime;

#include ../includes/cnoise.glsl

void main() {
    vec3 positionB = position;
    float progress = uProgress / 0.5 - cnoise(aPositionA) / 0.5;
    progress = clamp(progress, 0.0, 1.0);
    positionB.y += sin(uTime * 2.0 + aPositionA.x * 20.0) * 0.2 * (1.0 - progress);
    vec3 targetPosition = mix(aPositionA, positionB, progress);

    vec4 modelPosition = modelMatrix * vec4(targetPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    gl_PointSize = 100.0 * uPixelRatio;

    gl_PointSize *= (1.0 / - viewPosition.z);
}
