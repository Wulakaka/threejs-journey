uniform float uTime;

varying vec2 vUv;

vec3 rgb2hsb(in vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),
                 vec4(c.gb, K.xy),
                 step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),
                 vec4(c.r, p.yzx),
                 step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                d / (q.x + e),
                q.x);
}

//  Function from Iñigo Quiles
//  https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0),
                             6.0) - 3.0) - 1.0,
                     0.0,
                     1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
    float x = -cos(uTime) * 0.5 + 0.5;
    float y = sin(uTime) * 0.5;


    float strength = distance(vUv, vec2(x, y));
    strength *= 4.0;

    float steps = 2.0;
    strength *= steps;
    strength = floor(strength);
    strength /= steps;

    vec3 colorRed = vec3(214, 140, 98) / 255.0;
    vec3 colorBlue = vec3(99, 119, 167) / 255.0;
    vec3 color = mix(colorRed, colorBlue, strength);

//    strength = clamp(strength, 0.0, 1.0);
//    vec3 colorRed = vec3(0.0, 1.0, 1.0);
//    vec3 colorPurple = vec3(1.0, 1.0, 1.0);
//    vec3 color = mix(colorRed, colorPurple, strength);
//    color = hsb2rgb(color);

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
}