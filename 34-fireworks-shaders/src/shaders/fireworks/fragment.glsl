uniform sampler2D uTexture;
uniform vec3 uColor;
varying float vColorHue;

#include ../includes/hsb2rgb.glsl
void main() {
    float alpha = texture(uTexture, gl_PointCoord).r;

    vec3 color = hsb2rgb(vec3(vColorHue, 1.0, 1.0));
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
