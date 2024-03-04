uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute float aRandom;

attribute vec2 uv;

varying float vRandom;

varying vec2 vUv;

varying float vElevation;

// 不同顶点对应的值不同
attribute vec3 position;

uniform vec2 uFrequency;

uniform float uTime;

void main() {
  // 从右往左乘
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  // modelPosition.z += sin(modelPosition.x * 10.0) * 0.1;
  // modelPosition.z += aRandom * 0.1;
  float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
  elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;
  modelPosition.z += elevation;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  vRandom = aRandom;

  vUv = uv;

  vElevation = elevation;
}