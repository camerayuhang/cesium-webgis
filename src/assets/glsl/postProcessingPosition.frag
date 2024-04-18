// #version 300 es

precision highp float;

in vec2 v_textureCoordinates;
out vec4 fragColor;

uniform sampler2D nextParticlesPosition;
uniform sampler2D particlesSpeed; // (u, v, w, norm)
// 速度纹理
uniform sampler2D U; // eastward wind 
uniform sampler2D V; // northward wind
uniform vec3 interval;
uniform vec3 dimension; // (lon, lat, lev)
// range (min, max)
uniform vec2 lonRange;
uniform vec2 latRange;

uniform float randomCoefficient; // use to improve the pseudo-random generator
uniform float dropRate; // drop rate is a chance a particle will restart at random position to avoid degeneration
uniform float dropRateBump;
// 传入数据的经纬度范围
uniform vec3 minimum;
uniform vec3 maximum;

// pseudo-random generator
const vec3 randomConstants = vec3(12.9898, 78.233, 4375.85453);
const vec2 normalRange = vec2(0.0, 1.0);

// 在范围内随机产生一个数（一个伪随机数生成器）
float rand(vec2 seed, vec2 range) {
    vec2 randomSeed = randomCoefficient * seed;
    float temp = dot(randomConstants.xy, randomSeed);
    temp = fract(sin(temp) * (randomConstants.z + temp));
    return temp * (range.y - range.x) + range.x;
}

vec2 mapPositionToNormalizedIndex2D(vec3 lonLatLev) {
    // 经纬度限定在规定范围内
    lonLatLev.x = clamp(lonLatLev.x, minimum.x, maximum.x);
    lonLatLev.y = clamp(lonLatLev.y, minimum.y, maximum.y);
    vec3 index3D = vec3(0.0);
    // index3D描述当前点所处的网格位置（与起始点的距离）
    index3D.x = (lonLatLev.x - minimum.x) / interval.x;
    index3D.y = (lonLatLev.y - minimum.y) / interval.y;
    index3D.z = (lonLatLev.z - minimum.z) / interval.z;

    vec2 index2D = vec2(index3D.x, index3D.z * dimension.y + index3D.y);
    // 进行归一化处理（对应纹理坐标）
    vec2 normalizedIndex2D = vec2(index2D.x / dimension.x, index2D.y / (dimension.y * dimension.z));
    return normalizedIndex2D;
}

// 获得当前位置的速度纹理（传入网格点）
float getWindComponent(sampler2D componentTexture, vec3 lonLatLev) {
    // 计算网格点的纹理坐标
    vec2 normalizedIndex2D = mapPositionToNormalizedIndex2D(lonLatLev);
    // 获取网格点的纹理像素（以一个点为单位）
    float result = texture(componentTexture, normalizedIndex2D).r;
    return result;
}
// 双线性内插计算点的速度纹理像素
float interpolateTexture(sampler2D componentTexture, vec3 lonLatLev) {
    float lon = lonLatLev.x;
    float lat = lonLatLev.y;
    float lev = lonLatLev.z;
    // 获取包围当前点的四个格网点
    float lon0 = floor(lon / interval.x) * interval.x;
    float lon1 = lon0 + 1.0 * interval.x;
    float lat0 = floor(lat / interval.y) * interval.y;
    float lat1 = lat0 + 1.0 * interval.y;
    // 分别获取四个点的纹理像素
    float lon0_lat0 = getWindComponent(componentTexture, vec3(lon0, lat0, lev));
    float lon1_lat0 = getWindComponent(componentTexture, vec3(lon1, lat0, lev));
    float lon0_lat1 = getWindComponent(componentTexture, vec3(lon0, lat1, lev));
    float lon1_lat1 = getWindComponent(componentTexture, vec3(lon1, lat1, lev));
    // 双线性内插计算当前点的纹理
    float lon_lat0 = mix(lon0_lat0, lon1_lat0, lon - lon0);
    float lon_lat1 = mix(lon0_lat1, lon1_lat1, lon - lon0);
    float lon_lat = mix(lon_lat0, lon_lat1, lat - lat0);
    return lon_lat;
}
// 产生随机粒子
vec3 generateRandomParticle(vec2 seed, float lev) {
    float randomLon;
    if (rand(seed, vec2(minimum.x, maximum.x)) <= maximum.x && rand(seed, vec2(minimum.x, maximum.x)) >= minimum.x) {
        randomLon = rand(seed, vec2(minimum.x, maximum.x));
    }
    float randomLat;
    if (rand(seed, vec2(minimum.y, maximum.y)) <= maximum.y && rand(seed, vec2(minimum.y, maximum.y)) >= minimum.y) {
        randomLat = rand(-seed, vec2(minimum.y, maximum.y));
    }

    return vec3(randomLon, randomLat, lev);
}

// 判断是否超过范围
bool particleOutbound(vec3 particle) {
    return (particle.y < minimum.y || particle.y > maximum.y || particle.x<minimum.x || particle.x>maximum.x);
}

void main() {
    //获得下一个粒子的位置坐标纹理
    vec3 nextParticle = texture(nextParticlesPosition, v_textureCoordinates).rgb;
    // 获得粒子的速度纹理
    vec4 nextSpeed = texture(particlesSpeed, v_textureCoordinates);

    float speedNorm = nextSpeed.a;
    // 定义粒子的消亡率
    float particleDropRate = dropRate + dropRateBump * speedNorm;
    //设置随机数种子 
    vec2 seed1 = nextParticle.xy + v_textureCoordinates;
    vec2 seed2 = nextSpeed.xy + v_textureCoordinates;
    // 产生一个随机的粒子
    vec3 randomParticle = generateRandomParticle(seed1, nextParticle.z);
    // 这个随机数决定粒子是否超过生命周期
    float randomNumber = rand(seed2, normalRange);
    // 如果这个随机数小于消亡率或是粒子超限，则重新生成一个粒子(确保粒子速度不为0)
    if (randomNumber < particleDropRate || particleOutbound(nextParticle)) {
        for (int i = 0; i < 50; i++) {
            float u = interpolateTexture(U, randomParticle);
            float v = interpolateTexture(V, randomParticle);
            if(u==0.0&&v==0.0){
                randomParticle = generateRandomParticle(seed1+czm_frameNumber, nextParticle.z);
            }else{
                break;
            }
        }
        fragColor = vec4(randomParticle, 1.0); // 1.0 means this is a random particle
    } else {
        fragColor = vec4(nextParticle, 0.0);
    }
}
