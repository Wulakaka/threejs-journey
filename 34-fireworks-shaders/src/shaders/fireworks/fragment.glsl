uniform sampler2D uTexture;

void main() {
        float alpha = texture(uTexture, gl_PointCoord).r;

    gl_FragColor = vec4(vec3(1.0), alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
