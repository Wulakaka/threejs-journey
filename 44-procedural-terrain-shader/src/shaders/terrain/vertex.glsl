#include ../includes/simplexNoise2d.glsl

float getElevation(vec2 position) {
    float uPositionFrequency = 0.2;
    float elevation = 0.0;
    elevation += simplexNoise2d(position * uPositionFrequency) / 2.0;
    elevation += simplexNoise2d(position * uPositionFrequency * 2.0) / 4.0;
    elevation += simplexNoise2d(position * uPositionFrequency * 4.0) / 8.0;
    float elecvationSign = sign(elevation);
    // 让接近 0 的区域更平坦
    elevation = pow(abs(elevation), 2.0) * elecvationSign;
    return elevation;
}
void main() {
    csm_Position.y += getElevation(csm_Position.xz);
    float shift = 0.01;
    vec3 positionA = position + vec3(shift, 0.0, 0.0);
    vec3 positionB = position + vec3(0.0, 0.0, - shift);
    positionA.y += getElevation(positionA.xz);
    positionB.y += getElevation(positionB.xz);
    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);
    csm_Normal = cross(toA, toB);
}