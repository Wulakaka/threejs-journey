uniform vec2 uResolution;
uniform float uSize;
uniform sampler2D uParticlesTexture;

varying vec3 vColor;

attribute vec2 aParticlesUv;
attribute float aSize;
attribute vec3 aColor;

void main()
{
    vec4 particle = texture(uParticlesTexture, aParticlesUv);
    // Final position
    vec4 modelPosition = modelMatrix * vec4(particle.xyz, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    float sizeIn = smoothstep(0.0, 0.1, particle.a);
    float sizeOut = smoothstep(1.0, 0.7, particle.a);
    float size = min(sizeIn, sizeOut);
    gl_PointSize = size * aSize * uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    vColor = aColor;
}
