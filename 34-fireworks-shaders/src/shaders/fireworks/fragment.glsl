uniform sampler2D uTexture;

void main() {
    //    float alpha = texture(uTexture, gl_FragCoord).r;

    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
