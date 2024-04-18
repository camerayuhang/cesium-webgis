// #version 300 es

precision highp float;

in vec4 v_color;
out vec4 fragColor;

void main() {
    // 定义片元的颜色
    // const vec4 purple = vec4(0.0745, 0.2078, 0.9686, 0.5);
    fragColor = v_color;
}
