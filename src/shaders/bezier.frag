// title: Кривая Безье
// Кубическая кривая и построение де Кастельжо.
// Зажми мышь, чтобы утащить последнюю контрольную точку.

#define SEGMENTS 48

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

float disc(vec2 p, vec2 c, float r, float px) {
    return 1.0 - smoothstep(r - px, r + px, length(p - c));
}

float ring(vec2 p, vec2 c, float r, float w, float px) {
    return 1.0 - smoothstep(w - px, w + px, abs(length(p - c) - r));
}

vec2 bezier(vec2 a, vec2 b, vec2 c, vec2 d, float t) {
    float u = 1.0 - t;
    return u * u * u * a + 3.0 * u * u * t * b + 3.0 * u * t * t * c + t * t * t * d;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 res = iResolution.xy;
    vec2 p   = (fragCoord - 0.5 * res) / res.y;
    float px = 1.3 / res.y;

    // контрольные точки; последнюю можно таскать мышью
    vec2 A = vec2(-0.40, -0.22);
    vec2 B = vec2(-0.17,  0.26 + 0.10 * sin(iTime * 0.75));
    vec2 C = vec2( 0.17, -0.28 + 0.12 * cos(iTime * 0.55));
    vec2 D = vec2( 0.40,  0.20);
    if (iMouse.z > 0.0) D = (iMouse.xy - 0.5 * res) / res.y;

    vec3 col = paper(p, px);

    // контрольный многоугольник
    float hull = 0.0;
    hull = max(hull, segment(p, A, B, 0.0012, px));
    hull = max(hull, segment(p, B, C, 0.0012, px));
    hull = max(hull, segment(p, C, D, 0.0012, px));
    col = mix(col, WARM, hull * 0.7);

    // построение де Кастельжо в текущий момент t
    float t = 0.5 - 0.5 * cos(iTime * 0.5);
    vec2 ab = mix(A, B, t), bc = mix(B, C, t), cd = mix(C, D, t);
    vec2 abc = mix(ab, bc, t), bcd = mix(bc, cd, t);
    vec2 pt = mix(abc, bcd, t);

    float aux = 0.0;
    aux = max(aux, segment(p, ab, bc, 0.0012, px));
    aux = max(aux, segment(p, bc, cd, 0.0012, px));
    aux = max(aux, segment(p, abc, bcd, 0.0016, px));
    col = mix(col, WARM, aux);

    // сама кривая
    float curve = 0.0;
    vec2 prev = A;
    for (int i = 1; i <= SEGMENTS; i++) {
        vec2 cur = bezier(A, B, C, D, float(i) / float(SEGMENTS));
        curve = max(curve, segment(p, prev, cur, 0.0032, px));
        prev = cur;
    }
    col = mix(col, INK, curve);

    // маркеры: контрольные точки полые, бегущая точка залитая
    float marks = 0.0;
    marks = max(marks, ring(p, A, 0.011, 0.0018, px));
    marks = max(marks, ring(p, B, 0.011, 0.0018, px));
    marks = max(marks, ring(p, C, 0.011, 0.0018, px));
    marks = max(marks, ring(p, D, 0.011, 0.0018, px));
    marks = max(marks, disc(p, pt, 0.013, px));
    col = mix(col, INK, marks);

    fragColor = vec4(finish(col, p, fragCoord), 1.0);
}
