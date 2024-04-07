attribute float aSize;
attribute float aTimeMultiplier;

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax)
{
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}

void main() {

    vec3 newPosition = position;

    float split = 0.25;
    if (uProgress < split) {
        float progress = remap(uProgress, 0.0, split, 0.0, 1.0);
        progress = clamp(progress, 0.0, 1.0);
        //        progress *= aTimeMultiplier;

        // 上升
        float progressRising = remap(progress, 0.0, 1.0, 0.0, 1.0);
        float v = 3.0;
        float a = 2.5;
        float h = (v + v - a) * 0.5;
        progressRising = (v + v - progressRising * a) * progressRising * 0.5;
        newPosition = vec3(0.0, -h + progressRising, 0.0);

        // Twinkling 闪烁
        float progressTwinkling = remap(progress, 0.2, 1.0, 0.0, 1.0);
        progressTwinkling = clamp(progressTwinkling, 0.0, 1.0);
        float twinklingSize = sin(progressTwinkling * 10.0) * 0.3 + 0.7;
        twinklingSize -= progressTwinkling * 0.2;
        twinklingSize = clamp(twinklingSize, 0.0, 1.0);
        // 0 - 0.2 时 progress 为 0，为了不让size变化，需要将 twinklingSize 保持为 1
        twinklingSize = 1.0 - twinklingSize * progressTwinkling;

        gl_PointSize = uSize * uResolution.y * aSize * twinklingSize * 0.1;

    } else {
        // 增加时间偏移
        float progress = remap(uProgress, split, 1.0, 0.0, 1.0);
        progress = clamp(progress, 0.0, 1.0);
        progress *= aTimeMultiplier;


        // Exploding 爆炸
        float progressExploding = remap(progress, 0.0, 0.1, 0.0, 1.0);
        progressExploding = clamp(progressExploding, 0.0, 1.0);
        progressExploding = 1.0 - pow(1.0 - progressExploding, 3.0);
        //    newPosition *= progressExploding; 效果是一样的
        newPosition = mix(vec3(0.0), newPosition, progressExploding);

        // Falling 下落
        float progressFalling = remap(progress, 0.1, 1.0, 0.0, 1.0);
        progressFalling = clamp(progressFalling, 0.0, 1.0);
        progressFalling = 1.0 - pow(1.0 - progressFalling, 3.0);
        newPosition.y -= progressFalling * 0.2;

        // Scaling 缩放
        float progressScalingOpen = remap(progress, 0.0, 0.125, 0.0, 1.0);
        float progressScalingClose = remap(progress, 0.125, 1.0, 1.0, 0.0);
        float progressScaling = min(progressScalingOpen, progressScalingClose);
        progressScaling = clamp(progressScaling, 0.0, 1.0);

        // Twinkling 闪烁
        float progressTwinkling = remap(progress, 0.2, 0.8, 0.0, 1.0);
        progressTwinkling = clamp(progressTwinkling, 0.0, 1.0);
        float twinklingSize = sin(progressTwinkling * 30.0) * 0.5 + 0.5;
        // 0 - 0.2 时 progress 为 0，为了不让size变化，需要将 twinklingSize 保持为 1
        twinklingSize = 1.0 - twinklingSize * progressTwinkling;

        gl_PointSize = uSize * uResolution.y * aSize * progressScaling * twinklingSize;

    }

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    gl_PointSize *= 1.0 / -viewPosition.z;

    if (gl_PointSize < 1.0)
    gl_Position = vec4(9999.9); // Hide particles when they are too small
}
