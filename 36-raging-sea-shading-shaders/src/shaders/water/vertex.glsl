uniform float uTime;
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesSpeed;

uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallIterations;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/perlinClassic3D.glsl

float waveElevation (vec3 position) {
    // Elevation
    float elevation = sin(position.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) *
        sin(position.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) *
        uBigWavesElevation;

    for(float i = 1.0; i <= uSmallIterations; i++)
    {
        elevation -= abs(perlinClassic3D(vec3(position.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)) * uSmallWavesElevation / i);
    }
    return elevation;
}


void main()
{
    // Base position
    float shift = 0.01;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // 为什么不是加在 position 上？因为 position 是局部坐标，而 modelPosition 是世界坐标，最终计算的是世界坐标的偏移
    vec3 modelPositionA = modelPosition.xyz + vec3(shift, 0.0, 0.0);
    vec3 modelPositionB = modelPosition.xyz + vec3(0.0, 0.0, -shift);

    float elevation = waveElevation(modelPosition.xyz);
    modelPosition.y += elevation;

    float elevationA = waveElevation(modelPositionA);
    modelPositionA.y += elevationA;
    float elevationB = waveElevation(modelPositionB);
    modelPositionB.y += elevationB;

    // Compute normal
    vec3 toA = modelPositionA - modelPosition.xyz;
    vec3 toB = modelPositionB - modelPosition.xyz;
    // cross product 用来计算法向量
    vec3 computedNormal = cross(toA, toB);

    // Final position
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Varyings
    vElevation = elevation;
    vNormal = computedNormal;
    // 基于三维世界的位置
    vPosition = modelPosition.xyz;
}
