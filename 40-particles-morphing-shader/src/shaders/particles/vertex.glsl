uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;
uniform vec3 uColorA;
uniform vec3 uColorB;
// frequency 决定了 noise 的变化的频率，频率越小，noise 在各顶点的差异越小
uniform float uNoiseFrequency;

attribute vec3 aTargetPosition;
attribute float aSize;

varying vec3 vColor;

#include ../includes/simplexNoise3d.glsl

void main()
{
    // mixed position
    float progress = uProgress;
    // simplexNoise3d 的返回值为 -1 - 1
    // 为了使开始和结束都有从部分开始消散的效果，需要计算结束时的 noise
    float noiseOrigin = simplexNoise3d(position * uNoiseFrequency);
    float noiseTarget = simplexNoise3d(aTargetPosition * uNoiseFrequency);
    float noise = mix(noiseOrigin, noiseTarget, uProgress);
    // remap noise，让范围变成 0 - 1
    noise = smoothstep(-1.0, 1.0, noise);
    // 从动画所需参数出发，比如 duration 和 delay
    float duration = 0.4;
    float delay = (1.0 - duration) * noise;
    float end = delay + duration;
    progress = smoothstep(delay, end, progress);
    vec3 newPosition = mix(position, aTargetPosition, progress);

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = aSize * uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    vColor = mix(uColorA, uColorB, noise);
}
