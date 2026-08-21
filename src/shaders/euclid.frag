// title: Циркуль и линейка
// «Стол Евклида» — циркуль и линейка.
// Пиши как на Shadertoy: доступны mainImage, iResolution, iTime, iFrame, iMouse.

#define PI 3.14159265359

const vec3 PAPER = vec3(0.945, 0.941, 0.886); // #F1F0E2
const vec3 INK   = vec3(0.353, 0.243, 0.212); // #5a3e36
const vec3 WARM  = vec3(0.643, 0.471, 0.384); // #A47864

// общий фон всех шейдеров: бумага в клетку
vec3 paper(vec2 p, float px) {
    vec2 g = abs(fract(p * 9.0 + 0.5) - 0.5) / 9.0;
    return mix(PAPER, WARM, (1.0 - smoothstep(0.0, px * 1.5, min(g.x, g.y))) * 0.12);
}

// общая финальная обработка: зерно бумаги и виньетка
vec3 finish(vec3 col, vec2 p, vec2 fragCoord) {
    float grain = fract(sin(dot(fragCoord, vec2(12.9898, 78.233))) * 43758.5453);
    col += (grain - 0.5) * 0.016;
    return col * (1.0 - 0.24 * dot(p, p));
}

float segment(vec2 p, vec2 a, vec2 b, float w, float px) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return 1.0 - smoothstep(w - px, w + px, length(pa - ba * h));
}

float ring(vec2 p, vec2 c, float r, float w, float px) {
    return 1.0 - smoothstep(w - px, w + px, abs(length(p - c) - r));
}

float disc(vec2 p, vec2 c, float r, float px) {
    return 1.0 - smoothstep(r - px, r + px, length(p - c));
}

float arc(vec2 p, vec2 c, float r, float a0, float span, float w, float px) {
    vec2 q = p - c;
    float m = 1.0 - smoothstep(w - px, w + px, abs(length(q) - r));
    float a = mod(atan(q.y, q.x) - a0, 2.0 * PI);
    return m * (1.0 - smoothstep(span, span + 0.04, a));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 res = iResolution.xy;
    vec2 p   = (fragCoord - 0.5 * res) / res.y; // центр в нуле, y в [-0.5, 0.5]
    float px = 1.3 / res.y;                     // ширина пикселя в этих координатах
    float t  = iTime * 0.22;

    // лёгкий параллакс за курсором
    vec2 mouse = (iMouse.xy - 0.5 * res) / res.y;
    float grabbed = step(0.5, iMouse.z);
    p -= mix(vec2(0.0), mouse * 0.06, grabbed);

    vec3 col = paper(p, px);

    float R = 0.33;
    float faint = 0.0; // вспомогательные построения
    float solid = 0.0; // основной чертёж

    // «цветок жизни»: шесть окружностей по несущей окружности
    for (int i = 0; i < 6; i++) {
        float a = float(i) * PI / 3.0 + t;
        vec2  c = vec2(cos(a), sin(a)) * R;
        faint = max(faint, ring(p, c, R, 0.0016, px) * (0.45 + 0.35 * sin(iTime * 0.7 + float(i) * 1.7)));
    }

    // несущая окружность
    solid = max(solid, ring(p, vec2(0.0), R, 0.0022, px));

    // вписанный треугольник, вращается в другую сторону
    float a0 = -t * 1.6;
    vec2 v0 = vec2(cos(a0), sin(a0)) * R;
    vec2 v1 = vec2(cos(a0 + 2.0944), sin(a0 + 2.0944)) * R;
    vec2 v2 = vec2(cos(a0 + 4.1888), sin(a0 + 4.1888)) * R;
    solid = max(solid, segment(p, v0, v1, 0.0020, px));
    solid = max(solid, segment(p, v1, v2, 0.0020, px));
    solid = max(solid, segment(p, v2, v0, 0.0020, px));

    // засечки циркуля в вершинах
    solid = max(solid, disc(p, v0, 0.0075, px));
    solid = max(solid, disc(p, v1, 0.0075, px));
    solid = max(solid, disc(p, v2, 0.0075, px));

    // дуга, которую «прочерчивает» циркуль
    float sweep = fract(iTime * 0.14);
    faint = max(faint, arc(p, v0, R * 0.86, a0 + PI * 0.55, sweep * 1.9 * PI, 0.0015, px) * 0.8);

    // раскладка по слоям
    col = mix(col, WARM, faint * 0.55);
    col = mix(col, INK,  solid);

    fragColor = vec4(finish(col, p, fragCoord), 1.0);
}
