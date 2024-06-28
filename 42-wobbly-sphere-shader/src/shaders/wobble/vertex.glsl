attribute vec4 tangent;

uniform float uTime;
uniform float uPositionFrequency;
uniform float uTimeFrequency;
uniform float uStrength;
uniform float uWarpPositionFrequency;
uniform float uWarpTimeFrequency;
uniform float uWarpStrength;

#include ../includes/simplexNoise4d.glsl

float getWobble(vec3 position) {
    vec3 warpedPosition = position;
    warpedPosition += simplexNoise4d(vec4(
        position * uWarpPositionFrequency, // XYZ
        uTime * uWarpTimeFrequency  // W
    )) * uWarpStrength;

    return simplexNoise4d(vec4(
        warpedPosition * uPositionFrequency, // XYZ
        uTime * uTimeFrequency  // W
    )) * uStrength;
}

void main() {
    vec3 biTangent = cross(normal, tangent.xyz);

    // Neighbours positions
    float shift = 0.01;
    vec3 positionA = csm_Position + shift * tangent.xyz;
    vec3 positionB = csm_Position + shift * biTangent;

    // Wobble
    float wobble = getWobble(csm_Position);
    // 算出三个点经过变换后的位置
    csm_Position += wobble * normal;
    positionA += getWobble(positionA) * normal;
    positionB += getWobble(positionB) *normal;
    // Compute normal
    vec3 toA = positionA - csm_Position;
    vec3 toB = positionB - csm_Position;
    // 最终计算出的法线需要赋值给 csm_Normal
    csm_Normal = cross(toA, toB);
}
