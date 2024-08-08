uniform float uSize;
uniform float uPixelRatio;
uniform float uTime;

attribute float aScale;
attribute float aFrequency;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float radius = 0.3;
    float frequency = aFrequency * 0.5;

    modelPosition.y += sin(uTime + modelPosition.x * 100.0) * aScale * 0.2;
    modelPosition.x += cos((uTime + aScale * 100.0) * frequency) * radius;
    modelPosition.z += sin((uTime + aScale * 100.0) * frequency * 1.5) * radius;


    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    gl_PointSize = uSize * aScale * uPixelRatio;
    gl_PointSize *= (1.0 / - viewPosition.z);
}
