varying vec2 vUv;
float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}
void main()
{
////    Pattern 1
//    gl_FragColor = vec4(vUv, 1.0, 1.0);
//    Pattern 2
//    让黄色变为 0，注意这里是 float，所以是 0.0
//    gl_FragColor = vec4(vUv, 0.0, 1.0);
//    Pattern 3
//    float strength = vUv.x;
//    Pattern 4
//    float strength = vUv.y;
//    Pattern 5
//    float strength = 1.0 - vUv.y;
//    Pattern 6
//    float strength = vUv.y * 10.0;
//    Pattern 7
//    float strength = mod(vUv.y * 10.0, 1.0);
//    Pattern 8
//    float strength = mod(vUv.y * 10.0, 1.0);
//    strength = step(0.5, strength);
//    Pattern 9
//    float strength = mod(vUv.y * 10.0, 1.0);
//    strength = step(0.8, strength);
//    Pattern 10
//    float strength = mod(vUv.x * 10.0, 1.0);
//    strength = step(0.8, strength);
//    Pattern 11
//    float barX = mod(vUv.x * 10.0, 1.0);
//    barX = step(0.8, barX);
//    float barY = mod(vUv.y * 10.0, 1.0);
//    barY = step(0.8, barY);
//    float bar = barX + barY;
//    Pattern 12
//    float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
//    strength *= step(0.8,mod(vUv.y * 10.0, 1.0));
//    Pattern 13
//    float strength = step(0.4, mod(vUv.x * 10.0, 1.0));
//    strength *= step(0.8,mod(vUv.y * 10.0, 1.0));
//    Pattern 14
//    float barX = step(0.4, mod(vUv.x * 10.0, 1.0)) * step(0.8,mod(vUv.y * 10.0, 1.0));
//    float barY = step(0.8, mod(vUv.x * 10.0, 1.0)) * step(0.4,mod(vUv.y * 10.0, 1.0));
//    float strength = barX + barY;
//    Pattern 15
//    在 mod 函数中 -0.2 是为了让条纹的向左移动 0.2，也就是更晚到达边界
//    float barX = step(0.4, mod(vUv.x * 10.0 - 0.2, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
//    float barY = step(0.8, mod(vUv.x * 10.0, 1.0)) * step(0.4, mod(vUv.y * 10.0 - 0.2, 1.0));
//    float strength = barX + barY;
//    Pattern 16
//    float strength = abs(vUv.x - 0.5);
//    Pattern 17
//    float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
//    Pattern 18
//    float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
//    Pattern 19
//    float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
//    strength = step(0.2, strength);
//    Pattern 20
//    利用两个 square 来做交集
//    float square1 = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
//    square1 = 1.0 - step(0.25, square1);
//    float square2 = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
//    float strength = square1 * square2;
//    Pattern 21
//    float strength = floor(vUv.x * 10.0) / 10.0;
//    Pattern 22
//    float strength = floor(vUv.x * 10.0) / 10.0 * floor(vUv.y * 10.0) / 10.0;
//    Pattern 23
    float strength = random(vUv);
gl_FragColor = vec4(vec3(strength), 1.0);
}