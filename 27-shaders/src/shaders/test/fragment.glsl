// mediump 指定精度
precision mediump float;

uniform vec3 uColor;
uniform sampler2D uTexture;

varying float vRandom;
varying vec2 vUv;
varying float vElevation;

void main() {
  vec4 textureColor = texture2D(uTexture, vUv);
  // 明暗变化
  textureColor.rgb *= vElevation * 2.0 + 0.5;
  gl_FragColor = textureColor;
}