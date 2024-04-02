attribute float aSize;

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax)
{
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}

void main() {

    vec3 newPosition = position;


    // Exploding 爆炸
    float progressExploding = remap(uProgress, 0.0, 0.1, 0.0, 1.0);
    progressExploding = clamp(progressExploding, 0.0, 1.0);
    progressExploding = 1.0 - pow(1.0 - progressExploding, 3.0);
    //    newPosition *= progressExploding; 效果是一样的
    newPosition = mix(vec3(0.0), newPosition, progressExploding);

    // Falling 下落
    float progressFalling = remap(uProgress, 0.1, 1.0, 0.0, 1.0);
    progressFalling = clamp(progressFalling, 0.0, 1.0);
    progressFalling = 1.0 - pow(1.0 - progressFalling, 3.0);
    newPosition.y -= progressFalling * 0.2;

    // Scaling 缩放
    float progressScalingOpen = remap(uProgress, 0.0, 0.125, 0.0, 1.0);
    float progressScalingClose = remap(uProgress, 0.125, 1.0, 1.0, 0.0);
    float progressScaling = min(progressScalingOpen, progressScalingClose);
    progressScaling = clamp(progressScaling, 0.0, 1.0);

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    gl_PointSize = uSize * uResolution.y * aSize * progressScaling;
    gl_PointSize *= 1.0 / -viewPosition.z;

}
