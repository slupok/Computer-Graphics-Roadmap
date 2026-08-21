// title: Растеризация треугольника
// Рёберные функции решают, попал ли центр пикселя внутрь,
// барицентрические координаты задают его оттенок.
// Зажми мышь, чтобы утащить верхнюю вершину.

#define GRID 26.0

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

// знаковая площадь: положительна слева от ребра a→b
float edgeFn(vec2 a, vec2 b, vec2 p) {
    return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 res = iResolution.xy;
    vec2 p   = (fragCoord - 0.5 * res) / res.y;
    float px = 1.3 / res.y;

    float t = iTime * 0.3;
    vec2 A = vec2(cos(t), sin(t)) * 0.34;
    vec2 B = vec2(cos(t + 2.0944), sin(t + 2.0944)) * 0.34;
    vec2 C = vec2(cos(t + 4.1888), sin(t + 4.1888)) * 0.34;
    if (iMouse.z > 0.0) A = (iMouse.xy - 0.5 * res) / res.y;

    vec3 col = paper(p, px);

    // центр «пикселя», в который попала эта точка экрана
    vec2 cell   = floor(p * GRID);
    vec2 center = (cell + 0.5) / GRID;

    float area = edgeFn(A, B, C);
    if (abs(area) > 0.00001) {
        // барицентрические координаты центра пикселя
        float w0 = edgeFn(B, C, center) / area;
        float w1 = edgeFn(C, A, center) / area;
        float w2 = edgeFn(A, B, center) / area;

        if (w0 >= 0.0 && w1 >= 0.0 && w2 >= 0.0) {
            // оттенок интерполируется по вершинам
            vec3 shade = w0 * WARM + w1 * mix(WARM, INK, 0.55) + w2 * mix(PAPER, WARM, 0.55);

            // рамка пикселя, чтобы растр читался как растр
            float gp = px * GRID;
            vec2 f = abs(fract(p * GRID) - 0.5);
            float border = 1.0 - smoothstep(0.44 - gp, 0.44 + gp, max(f.x, f.y));

            col = mix(col, shade, 0.88 * border + 0.55 * (1.0 - border));
        }
    }

    // поверх растра — идеальная геометрия
    float wire = 0.0;
    wire = max(wire, segment(p, A, B, 0.0016, px));
    wire = max(wire, segment(p, B, C, 0.0016, px));
    wire = max(wire, segment(p, C, A, 0.0016, px));
    wire = max(wire, ring(p, A, 0.012, 0.0018, px));
    wire = max(wire, ring(p, B, 0.012, 0.0018, px));
    wire = max(wire, ring(p, C, 0.012, 0.0018, px));
    col = mix(col, INK, wire);

    fragColor = vec4(finish(col, p, fragCoord), 1.0);
}
