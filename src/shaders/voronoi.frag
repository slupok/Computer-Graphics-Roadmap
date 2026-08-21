// title: Диаграмма Вороного
// Рёбра — точки, равноудалённые от двух ближайших сайтов.
// Зажми мышь, чтобы добавить свой сайт под курсором.

#define SCALE 4.0

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

vec2 hash2(vec2 p) {
    vec2 h = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(h) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 res = iResolution.xy;
    vec2 uv  = (fragCoord - 0.5 * res) / res.y;
    float px = 1.3 / res.y;

    // всё считаем в единицах клетки, чтобы расстояния были сравнимы
    vec2 g  = uv * SCALE;
    float gpx = px * SCALE;
    vec2 base = floor(g);

    float d1 = 10000.0, d2 = 10000.0; // до ближайшего и второго сайта

    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 cell = base + vec2(float(i), float(j));
            vec2 h = hash2(cell);
            // сайт лениво дрейфует внутри своей клетки
            vec2 site = cell + 0.5 + 0.40 * sin(iTime * 0.45 + 6.2831 * h);
            float d = length(site - g);
            if (d < d1) {
                d2 = d1; d1 = d;
            } else if (d < d2) {
                d2 = d;
            }
        }
    }

    // курсор — ещё один сайт
    if (iMouse.z > 0.0) {
        vec2 site = ((iMouse.xy - 0.5 * res) / res.y) * SCALE;
        float d = length(site - g);
        if (d < d1) {
            d2 = d1; d1 = d;
        } else if (d < d2) {
            d2 = d;
        }
    }

    vec3 col = paper(uv, px);

    // до ребра примерно половина разрыва между двумя ближайшими расстояниями
    float edge = 1.0 - smoothstep(0.006 - gpx, 0.006 + gpx, (d2 - d1) * 0.5);
    col = mix(col, WARM, edge * 0.85);

    // сайты: каждая точка рисует свой ближайший, так отрисовываются все
    float dots = 1.0 - smoothstep(0.045 - gpx, 0.045 + gpx, d1);
    col = mix(col, INK, dots);

    fragColor = vec4(finish(col, uv, fragCoord), 1.0);
}
