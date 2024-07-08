uniform vec3 uColorWaterDeep;
uniform vec3 uColorWaterSurface;
uniform vec3 uColorSand;
uniform vec3 uColorGrass;
uniform vec3 uColorSnow;
uniform vec3 uColorRock;

varying vec3 vPosition;
varying float vUpDot;

#include ../includes/simplexNoise2d.glsl

void main() {
    vec3 color = vec3(1.0);

    // warter
    float waterSurfaceMix = smoothstep(-1.0, -0.1, vPosition.y);
    color = mix(uColorWaterDeep, uColorWaterSurface, waterSurfaceMix);

    // sand
    float sandMix = step(-0.1, vPosition.y);
    color = mix(color, uColorSand, sandMix);

    // grass
    float grassMix = step(0.0, vPosition.y);
    color = mix(color, uColorGrass, grassMix);

    // rock
    float rockMix = 1.0 - step(0.8, vUpDot);
    // 只有在地面以上的区域才会有岩石
    rockMix *= step(-0.06, vPosition.y);
    color = mix(color, uColorRock, rockMix);

    // snow
    float threshold = 0.45;
    threshold += simplexNoise2d(vPosition.xz * 15.0) * 0.1;
    float snowMix = step(threshold, vPosition.y);
    color = mix(color, uColorSnow, snowMix);

    csm_DiffuseColor = vec4(color, 1.0);
}
