uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uDisplacementTexture;

attribute float aIntensity;
attribute float aAngle;

varying vec3 vColor;
void main()
{
    vec3 newPosition = position;
    float displacementIntensity = texture(uDisplacementTexture, uv).r;
    // edge1 为了处理 canvas 无法变为全黑的 bug
    // edge2 可以使 particle 停留一段时间再开始回到初始位置
    displacementIntensity =smoothstep(0.1, 0.3, displacementIntensity);
    vec3 displacement = vec3(cos(aAngle) * 0.4, sin(aAngle) * 0.4, 1.0);
    displacement = normalize(displacement);
    displacement *= displacementIntensity;
    displacement *= 2.0;
    displacement *= aIntensity;
    newPosition += displacement;

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Picture
    float pictureIntensity = texture(uPictureTexture, uv).r;


    // Point size
    gl_PointSize = 0.15 * pictureIntensity * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    vColor = vec3(pow(pictureIntensity, 2.0));
}
