uniform sampler2D u_texture;
uniform float u_screen_width;
uniform float u_screen_height;

uniform int u_cell_x;
uniform int u_cell_y;

varying vec2 f_uv;

void main() {
    gl_FragColor = texture2D(u_texture, f_uv);
}