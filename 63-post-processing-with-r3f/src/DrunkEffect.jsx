import { Effect, BlendFunction } from "postprocessing";
import { Uniform, Color } from "three";

const fragmentShader = /* glsl */ `
  uniform float frequency;
  uniform float amplitude;
  uniform float time;
  uniform float speed;
  uniform vec3 color;

  void mainUv(inout vec2 uv){
    uv.y += sin(uv.x * frequency + time * speed) * amplitude;
  }
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    outputColor = vec4(color, inputColor.a);
  }
`;

export default class DrunkEffect extends Effect {
  constructor({
    frequency,
    amplitude,
    blendFunction = BlendFunction.DARKEN,
    speed = 1,
    color,
  }) {
    super("DrunkEffect", fragmentShader, {
      uniforms: new Map([
        ["frequency", new Uniform(frequency)],
        ["amplitude", new Uniform(amplitude)],
        ["time", new Uniform(0)],
        ["color", new Uniform(new Color(color))],
        ["speed", new Uniform(speed)],
      ]),
      blendFunction,
    });
  }

  update(renderer, inputBuffer, deltaTime) {
    this.uniforms.get("time").value += deltaTime;
  }
}
