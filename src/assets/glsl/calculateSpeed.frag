// #version 300 es

precision highp float;

uniform sampler2D U; // eastward wind 
uniform sampler2D V; // northward wind
uniform sampler2D currentParticlesPosition; // (lon, lat, lev)

uniform vec3 dimension; // (lon, lat, lev)
uniform vec3 minimum; // minimum of each dimension
uniform vec3 maximum; // maximum of each dimension
uniform vec3 interval; // interval of each dimension

// used to calculate the wind norm
uniform vec2 uSpeedRange; // (min, max);
uniform vec2 vSpeedRange;
uniform float pixelSize;
uniform float speedFactor;


in vec2 v_textureCoordinates;
out vec4 fragColor;

//将经纬度坐标进行归一化处理
vec2 mapPositionToNormalizedIndex2D(vec3 lonLatLev) {
    // lonLatLev.x = mod(lonLatLev.x, 360.0);
    // lonLatLev.y = clamp(lonLatLev.y, -90.0, 90.0);
    // 经纬度限定在规定范围内
    lonLatLev.x = clamp(lonLatLev.x, minimum.x, maximum.x);
    lonLatLev.y = clamp(lonLatLev.y, minimum.y, maximum.y);
    vec3 index3D = vec3(0.0);
    // index3D描述当前点所处的网格位置（与起始点的距离）
    index3D.x = (lonLatLev.x - minimum.x) / interval.x;
    index3D.y = (lonLatLev.y - minimum.y) / interval.y;
    index3D.z = (lonLatLev.z - minimum.z) / interval.z;

    // the st texture coordinate corresponding to (col, row) index
    // example
    // data array is [0, 1, 2, 3, 4, 5], width = 3, height = 2
    // the content of texture will be
    // t 1.0
    //    |  3 4 5
    //    |
    //    |  0 1 2
    //   0.0------1.0 s

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
// 使用双线性内插计算出点的速度纹理像素(速度单位为米)
vec3 linearInterpolation(vec3 lonLatLev) {
    // https://en.wikipedia.org/wiki/Bilinear_interpolation
    float u = interpolateTexture(U, lonLatLev);
    float v = interpolateTexture(V, lonLatLev);
    float w = 0.0;
    return vec3(u, v, w);
}
// 计算纬度长度和经度长度（计算当前位置经纬度下，移动一度所需的米数）
vec2 lengthOfLonLat(vec3 lonLatLev) {
    // unit conversion: meters -> longitude latitude degrees
    // see https://en.wikipedia.org/wiki/Geographic_coordinate_system#Length_of_a_degree for detail

    // Calculate the length of a degree of latitude and longitude in meters
    float latitude = radians(lonLatLev.y);

    float term1 = 111132.92;
    float term2 = 559.82 * cos(2.0 * latitude);
    float term3 = 1.175 * cos(4.0 * latitude);
    float term4 = 0.0023 * cos(6.0 * latitude);
    float latLength = term1 - term2 + term3 - term4;

    float term5 = 111412.84 * cos(latitude);
    float term6 = 93.5 * cos(3.0 * latitude);
    float term7 = 0.118 * cos(5.0 * latitude);
    float longLength = term5 - term6 + term7;

    return vec2(longLength, latLength);
}
// 通过速度和当前经纬度位置计算出每次移动的度数（速度的米映射为度）
vec3 convertSpeedUnitToLonLat(vec3 lonLatLev, vec3 speed) {
    // 计算当前位置经纬度下，移动一度所需的米数
    vec2 lonLatLength = lengthOfLonLat(lonLatLev);
    // 计算在当前速度下，每次移动的度数
    float u = speed.x / lonLatLength.x;
    float v = speed.y / lonLatLength.y;
    float w = 0.0;
    // 得到每次移动的经纬度度数
    vec3 windVectorInLonLatLev = vec3(u, v, w);

    return windVectorInLonLatLev;
}
// 使用二阶-龙格库塔方法计算速度
vec3 calculateSpeedByRungeKutta2(vec3 lonLatLev, float speedScaleFactor) {
    //Yn=Yn-1+0.5K1+0.5K2
    // K1=hf(Xn-1,Yn-1)
    // K2=hf(Xn-1+h,Yn-1+K1)
    // see https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods#Second-order_methods_with_two_stages for detail
    // 指定步长为固定步长（实际步长为h*speedScaleFactor，speedScaleFactor由外部输入）
    const float h = 0.5;
    // 获得最终步长
    float s = h * speedScaleFactor;
    vec3 y_n = lonLatLev;
    // 计算该点的速度纹理
    vec3 f_n = linearInterpolation(lonLatLev);
    // 计算K1
    vec3 K1 = convertSpeedUnitToLonLat(y_n, f_n);
    // 计算第二个的位置
    vec3 midpoint = y_n + s * K1;
    // 计算出第二个点的速度纹理
    vec3 f_n2 = linearInterpolation(midpoint);
    // 计算K2
    vec3 K2 = convertSpeedUnitToLonLat(midpoint, f_n2);
    // 计算速度
    vec3 speed = 0.5 * s * K1 + 0.5 * s * K2;
    return speed;
}
// 使用四阶-龙格库塔方法计算速度
vec3 calculateSpeedByRungeKutta4(vec3 lonlatLev, float speedScaleFactor) {
    const float h = 0.1;
    // 获得最终步长
    float s = h * speedScaleFactor;
    vec3 y_n = lonlatLev;
    //  计算该点的速度纹理
    vec3 f_n = linearInterpolation(lonlatLev);
    // 计算K1
    vec3 K1 = convertSpeedUnitToLonLat(y_n, f_n);
    // 计算第二个点的位置
    vec3 second_y = y_n + 0.5 * s * K1;
    // 计算出第二个点的速度纹理
    vec3 f_n2 = linearInterpolation(second_y);
    // 计算K2
    vec3 K2 = convertSpeedUnitToLonLat(second_y, f_n2);
    // 计算第三个点的位置
    vec3 third_y = y_n + 0.5 * s * K2;
    // 计算出第三个点的速度纹理
    vec3 f_n3 = linearInterpolation(third_y);
    // 计算K3
    vec3 K3 = convertSpeedUnitToLonLat(third_y, f_n3);
    // 计算出第四个点
    vec3 forth_y = y_n + s * K3;
    // 计算出第四个点的速度纹理
    vec3 f_n4 = linearInterpolation(forth_y);
    // 计算K4
    vec3 K4 = convertSpeedUnitToLonLat(forth_y, f_n4);
    vec3 speed = s * (K1 + 2.0 * K2 + 2.0 * K3 + K4) / 6.0;
    return speed;
}
// 使用一阶-欧拉方法进行速度的计算
vec3 calculateSpeedByEuler(vec3 lonLatLev, float speedScaleFactor) {
    // Yn=Yn-1+hf
    const float h = 0.1;
    // 获得最终的步长
    float s = h * speedScaleFactor;
    vec3 y_n = lonLatLev;
    // 计算该点的速度纹理
    vec3 f_n = linearInterpolation(lonLatLev);
    // 计算速度，并进行单位转换
    vec3 speed = s * convertSpeedUnitToLonLat(y_n, f_n);
    return speed;
}
// 返回速度向量的长度
float calculateWindNorm(vec3 speed) {
    vec3 percent = vec3(0.0);
    percent.x = (speed.x - uSpeedRange.x) / (uSpeedRange.y - uSpeedRange.x);
    percent.y = (speed.y - vSpeedRange.x) / (vSpeedRange.y - vSpeedRange.x);
    // 向量的模长
    float norm = length(percent);

    return norm;
}

void main() {
    // 步长由像素大小和用户输入的参数共同决定
    float speedScaleFactor = speedFactor * pixelSize;
    // 获取当前点的位置纹理
    vec3 lonLatLev = texture(currentParticlesPosition, v_textureCoordinates).rgb;
    // 计算速度(使用四阶龙格库塔方法)
    vec3 speed = calculateSpeedByRungeKutta4(lonLatLev,speedScaleFactor);
    // 计算速度向量的长度
    float windNorm = calculateWindNorm(speed / speedScaleFactor);
    fragColor = vec4(speed, windNorm);
}
