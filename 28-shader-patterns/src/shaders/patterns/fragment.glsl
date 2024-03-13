uniform float uTime;

varying vec2 vUv;

#define PI 3.14159265358979323846

vec2 rotate2D(vec2 _st, float _angle){
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

float circle(in vec2 _st, in float _radius) {
    vec2 l = _st - vec2(0.5);
    return 1. - smoothstep(_radius - (_radius * 0.01),
                           _radius + (_radius * 0.01),
                           dot(l, l) * 4.0);
}

float box(vec2 _st, vec2 _size, float _smoothEdges) {
    _size = vec2(0.5) - _size * 0.5;
    vec2 aa = vec2(_smoothEdges * 0.5);
    vec2 uv = smoothstep(_size, _size + aa, _st);
    uv *= smoothstep(_size, _size + aa, vec2(1.0) - _st);
    return uv.x * uv.y;
}

// 生成网格
vec2 grid(in vec2 _st, in float _sizeX, in float _sizeY) {
    vec2 xy = fract(_st * vec2(_sizeX, _sizeY));
    return xy;
}

vec2 tile(vec2 _st, float _zoom){
    _st *= _zoom;
    return fract(_st);
}


void main() {

    // Divide the space in 4
    vec2 st = tile(vUv,4.);

    // Use a matrix to rotate the space 45 degrees
    st = rotate2D(st,PI*0.25);

    // Draw a square
    vec3 color = vec3(box(st,vec2(0.7),0.01));
    // color = vec3(st,0.0);


    //    float strength = distance(vUv, vec2(0.5));

    //    vec3 color = vec3(strength);
    //
    //        vec3 colorRed = vec3(214, 140, 98) / 255.0;
    //        vec3 colorBlue = vec3(99, 119, 167) / 255.0;
    //        color = mix(colorRed, colorBlue, strength);

    gl_FragColor = vec4(color, 1.0);

    //    #include <colorspace_fragment>
}
