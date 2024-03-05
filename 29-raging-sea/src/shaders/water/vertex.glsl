uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uTime;
uniform float uBigWavesSpeed;

varying float vElevation;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  float offset = uBigWavesSpeed * uTime;
  // Elevation
  float elevation = sin(modelPosition.x * uBigWavesFrequency.x + offset) *
    sin(modelPosition.z * uBigWavesFrequency.y + offset) *
    uBigWavesElevation;

  modelPosition.y += elevation;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
  vElevation = elevation;
}