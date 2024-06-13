void main()
{
    vec2 uv = gl_PointCoord;

    // 绘制锐利的圆形
    float distanceToCenter = distance(uv, vec2(0.5));
    if (distanceToCenter > 0.5) {
        discard;
    }

    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
