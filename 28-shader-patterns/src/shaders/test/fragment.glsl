#define PI 3.1415926535897932384626433832795

varying vec2 vUv;
float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
        cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
        cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
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
//    float strength = random(vUv);
//    Pattern 24
//    vec2 gridUv = vec2(floor(vUv.x * 10.0) / 10.0, floor(vUv.y * 10.0) / 10.0);
//    float strength = random(gridUv);
//    Pattern 25
//    vec2 gridUv = vec2(floor(vUv.x * 10.0) / 10.0, floor((vUv.y + vUv.x * 0.5)* 10.0) / 10.0 );
//    float strength = random(gridUv);
//    Pattern 26
//    float strength = length(vUv);
//    Pattern 27
//    float strength = distance(vUv, vec2(0.5));
//    Pattern 28
//    float strength = 1.0 - distance(vUv, vec2(0.5));
//    Pattern 29
//    float strength = 0.015 / distance(vUv, vec2(0.5));
//    Pattern 30
//    x 方向上与上个例子不同
//    vUv.x * 0.3 + 0.35 中的第二个参数可以带入 vUv.x = 0.5 时，结果为 0.5
//    float strength = 0.015 / distance(vec2(vUv.x * 0.3 + 0.35, vUv.y), vec2(0.5));
//    教程中的例子放大了整理，并变更了 y 轴
//    float strength = 0.15 / distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5));
//    Pattern 31
//    float strength = 0.15 / distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5));
//    strength *= 0.15 / distance(vec2(vUv.y, (vUv.x - 0.5) * 5.0 + 0.5), vec2(0.5));
//    Pattern 32
//    vec2 rotatedUv = rotate(vUv, PI / 4.0, vec2(0.5));
//    float strength = 0.15 / distance(vec2(rotatedUv.x, (rotatedUv.y - 0.5) * 5.0 + 0.5), vec2(0.5));
//    strength *= 0.15 / distance(vec2(rotatedUv.y, (rotatedUv.x - 0.5) * 5.0 + 0.5), vec2(0.5));
//    Pattern 33
//    也可以是 float strength = step(0.25, distance(vUv, vec2(0.5)))
//    float strength = step(0.5, distance(vUv, vec2(0.5)) + 0.25);
//    Pattern 34
//    中心到外圈是 0.5 - 0 - 0.5，所以是线性经过了绝对值变换
//    float strength = abs(distance(vUv, vec2(0.5)) - 0.25);
//    Pattern 35
//    float strength = step(0.01, abs(distance(vUv, vec2(0.5)) - 0.25));
//    Pattern 36
//    float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - 0.25));
//    Pattern 37
//    y 方向上加上了 sin(vUv.x) 函数
//    vec2 wavedUv = vec2(vUv.x, vUv.y + sin(vUv.x * 30.0) * 0.1);
//    float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));
//    Pattern 38
//    x 方向上也加上了 sin(vUv.x) 函数
//    vec2 wavedUv = vec2(vUv.x + sin(vUv.y * 30.0) * 0.1, vUv.y + sin(vUv.x * 30.0) * 0.1);
//    float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));
//    Pattern 39
//    加大了振幅
//    vec2 wavedUv = vec2(
//        vUv.x + sin(vUv.y * 100.0) * 0.1,
//        vUv.y + sin(vUv.x * 100.0) * 0.1
//    );
//    float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));
//    Pattern 40
//    从 y 轴顺时针的弧度制，如果是从 x 轴开始的逆时针，则是 atan(vUv.y, vUv.x)
//    float strength = atan(vUv.x, vUv.y);
//    Pattern 41
//    float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
//    float strength = angle;
//    Pattern 42
//    atan 的返回值是 - PI 到 PI，所以需要除以 PI * 2.0 的范围是 -0.5 到 0.5，最后需要加上 0.5 使得范围变为 0 到 1
//    -0.5 在正下方
//    float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
//    float strength = angle / (PI * 2.0);
//    strength += 0.5;
//    Pattern 43
//    重复出现的考虑使用 mod
//    float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (PI * 2.0) + 0.5;
//    float strength = mod(angle * 20.0, 1.0);
//    Pattern 44
//    并不是上一个做了 abs，而是 sin 函数
//    float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (PI * 2.0) + 0.5;
//    float strength = sin(angle * 100.0);
//    Pattern 45
//    增加了角度上的 sin 函数
    float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (PI * 2.0) + 0.5;
//    因为 angle 的范围是 0 - 1，为了让 sin 函数中的参数为弧度制，所以需要 * PI * 50.0
    float radius = 0.25 + sin(angle * PI * 50.0) * 0.02;
    float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - radius));
gl_FragColor = vec4(vec3(strength), 1.0);
}