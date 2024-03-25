uniform sampler2D uPerlin;
uniform float uTime;

varying vec2 vUv;

#include ../includes/rotate2D.glsl

void main() {
    vec3 newPosition = position;

    // Twist
    float twistPerlin = texture(uPerlin, vec2(0.5, uv.y * 0.2 - uTime * 0.005)).r;
    float angle = twistPerlin * 10.0;
    newPosition.xz = rotate2D(newPosition.xz, angle);

    // Wind
    // 随着时间推移，应用不同的随机
    vec2 windOffset = vec2(
        texture(uPerlin, vec2(0.25, uTime * 0.01)).r - 0.5,
        texture(uPerlin, vec2(0.75, uTime * 0.01)).r - 0.5
    );
    //    windOffset *=2.0;
    windOffset *= 10.0 * pow(uv.y, 2.0);
    newPosition.xz += windOffset;


    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    vUv = uv;
}
