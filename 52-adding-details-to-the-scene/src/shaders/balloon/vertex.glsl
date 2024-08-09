attribute vec3 aPositionA;

uniform float uPixelRatio;
uniform float uProgress;
uniform float uTime;

#include ../includes/cnoise.glsl

void main() {
    vec3 positionB = position;
    float noiseA = smoothstep(-1.0, 1.0, cnoise(aPositionA));
    float noiseB = smoothstep(-1.0, 1.0, cnoise(positionB));
    float noise = mix(noiseA, noiseB, uProgress);

    float duration = 0.4;
    float delay = (1.0 - duration) * noise;
    float end = delay + duration;
    float progress = smoothstep(delay, end, uProgress);

    positionB.y += sin(uTime * 2.0 + noiseA * 20.0) * 0.02;
    vec3 targetPosition = mix(aPositionA, positionB, progress);

    vec4 modelPosition = modelMatrix * vec4(targetPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    gl_PointSize = 100.0 * pow(progress, 0.5) * uPixelRatio;

    gl_PointSize *= (1.0 / - viewPosition.z);

    if(gl_PointSize < 1.0) {
        gl_Position = vec4(9999.9);
    }
}
