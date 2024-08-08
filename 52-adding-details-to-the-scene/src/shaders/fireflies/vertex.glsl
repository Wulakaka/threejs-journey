uniform float uSize;
uniform float uPixelRatio;
uniform float uTime;

attribute float aOffset;
attribute float aFrequency;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float radius = 0.3;

    float offset = aOffset * 10.0;
    float frequency = aFrequency * 2.0;

    modelPosition.x += cos((uTime+offset) * aFrequency) * radius;
    modelPosition.y += cos((uTime+offset) * aFrequency) * radius * 0.2;
    modelPosition.z += sin((uTime+offset) * aFrequency * 1.5) * radius;


    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    gl_PointSize = uSize * uPixelRatio;
    gl_PointSize *= (1.0 / - viewPosition.z);
}
