varying vec3 vPosition;

uniform float uSliceStart;
uniform float uSliceArc;

void main() {
    // angle 的取值范围是 [-PI, PI]
    float angle = atan(vPosition.y, vPosition.x);
    // 减去 uSliceStart，使得 uSliceStart 对应的角度为 0
    angle -= uSliceStart;
    // 保证 angle 的取值范围是 [0, 2PI]
    angle = mod(angle, PI * 2.0);
    if(angle > 0.0 && angle < uSliceArc) {
        discard;
    }

    csm_FragColor = vec4(vec3(angle), 1.0);
}
