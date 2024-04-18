// #version 300 es

precision highp float;

uniform sampler2D trailsColorTexture;
uniform sampler2D trailsDepthTexture;


in vec2 textureCoordinate;
out vec4 fragColor;

void main() {
    // 获取轨迹的颜色和深度
    vec4 trailsColor = texture(trailsColorTexture, textureCoordinate);
    float trailsDepth = texture(trailsDepthTexture, textureCoordinate).r;
    float globeDepth = czm_unpackDepth(texture(czm_globeDepthTexture, textureCoordinate));

    if (trailsDepth < globeDepth) {
        fragColor = trailsColor;
    } else {
        fragColor = vec4(0.0);
    }
}
