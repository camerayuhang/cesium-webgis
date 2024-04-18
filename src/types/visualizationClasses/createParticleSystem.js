/* eslint-disable @typescript-eslint/no-this-alias */
// 此类为一个工具类，可以做修改
var Util = (function () {
  // 封装请求服务的函数（可修改）
  var loadText = function (filePath) {
    // 创建一个用于请求后端的对象（类似于ajax，或者可以理解为ajax的底层）
    var request = new XMLHttpRequest();
    // 初始化请求参数（同步）
    request.open('GET', filePath, false);
    // 发送请求
    request.send();
    // 获得响应内容
    return request.responseText;
  };

  //
  var getFullscreenQuad = function () {
    // 定义个几何要素
    var fullscreenQuad = new Cesium.Geometry({
      // 定义几何要素中的每一个顶点属性
      attributes: new Cesium.GeometryAttributes({
        // 确定几何要素顶点的位置属性（x，y，z）
        position: new Cesium.GeometryAttribute({
          // 定义属性类型
          componentDatatype: Cesium.ComponentDatatype.FLOAT,
          // 指定组件数
          componentsPerAttribute: 3,
          //  v3----v2
          //  |     |
          //  |     |
          //  v0----v1
          // 一共定义了四个坐标（x,y,z)
          values: new Float32Array([
            -1,
            -1,
            0, // v0
            1,
            -1,
            0, // v1
            1,
            1,
            0, // v2
            -1,
            1,
            0, // v3
          ]),
        }),
        // 确定几何要素顶点的纹理属性
        st: new Cesium.GeometryAttribute({
          // 定义属性类型
          componentDatatype: Cesium.ComponentDatatype.FLOAT,
          // 指定组件数
          componentsPerAttribute: 2,
          // 一共定义了四个纹理属性
          values: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
        }),
      }),
      // 确定几何顶点的索引（按某一顺序将顶点进行组织，从而节省顶点的创建数量）
      indices: new Uint32Array([3, 2, 0, 0, 2, 1]),
    });
    return fullscreenQuad;
  };

  // 纹理对象的创建（该方法较为重要，不做修改)
  var createTexture = function (options, typedArray) {
    // 判断typedArray是否定义
    if (Cesium.defined(typedArray)) {
      // typed array needs to be passed as source option, this is required by Cesium.Texture
      // 定义一个source对象
      var source = {};
      source.arrayBufferView = typedArray;
      // 并给options中source属性赋值
      options.source = source;
    }
    // 创建纹理对象
    var texture = new Cesium.Texture(options);
    return texture;
  };
  // 帧缓存的创建（不做修改）
  var createFramebuffer = function (context, colorTexture, depthTexture) {
    // 创建具有可选初始颜色、深度和模板附件的帧缓冲区
    var framebuffer = new Cesium.Framebuffer({
      context: context,
      colorTextures: [colorTexture],
      depthTexture: depthTexture,
    });
    return framebuffer;
  };
  // 创建初始渲染状态
  var createRawRenderState = function (options) {
    var translucent = true;
    var closed = false;
    var existing = {
      viewport: options.viewport,
      depthTest: options.depthTest,
      depthMask: options.depthMask,
      blending: options.blending,
    };
    // 创建初始渲染状态
    var rawRenderState = Cesium.Appearance.getDefaultRenderState(translucent, closed, existing);
    return rawRenderState;
  };

  // 将矩形范围映射至经纬度范围
  var viewRectangleToLonLatRange = function (viewRectangle) {
    // 定义一个空对象
    var range = {};
    // Math.mode(x,y)返回x除y的余数
    var postiveWest = Cesium.Math.mod(viewRectangle.west, Cesium.Math.TWO_PI);
    var postiveEast = Cesium.Math.mod(viewRectangle.east, Cesium.Math.TWO_PI);
    var width = viewRectangle.width;

    var longitudeMin;
    var longitudeMax;
    // Cesium.Math.THREE_PI_OVER_TWO=3/2 pi
    if (width > Cesium.Math.THREE_PI_OVER_TWO) {
      longitudeMin = 0.0;
      longitudeMax = Cesium.Math.TWO_PI;
    } else {
      if (postiveEast - postiveWest < width) {
        longitudeMin = postiveWest;
        longitudeMax = postiveWest + width;
      } else {
        longitudeMin = postiveWest;
        longitudeMax = postiveEast;
      }
    }

    range.lon = {
      // 角度坐标转经纬度坐标
      min: Cesium.Math.toDegrees(longitudeMin),
      max: Cesium.Math.toDegrees(longitudeMax),
    };

    var south = viewRectangle.south;
    var north = viewRectangle.north;
    var height = viewRectangle.height;

    var extendHeight = height > Cesium.Math.PI / 12 ? height / 2 : 0;
    // 纬度值范围映射至[-1/2 pi,1/2 pi]
    var extendedSouth = Cesium.Math.clampToLatitudeRange(south - extendHeight);
    var extendedNorth = Cesium.Math.clampToLatitudeRange(north + extendHeight);

    // extend the bound in high latitude area to make sure it can cover all the visible area
    if (extendedSouth < -Cesium.Math.PI_OVER_THREE) {
      extendedSouth = -Cesium.Math.PI_OVER_TWO;
    }
    if (extendedNorth > Cesium.Math.PI_OVER_THREE) {
      extendedNorth = Cesium.Math.PI_OVER_TWO;
    }

    range.lat = {
      min: Cesium.Math.toDegrees(extendedSouth),
      max: Cesium.Math.toDegrees(extendedNorth),
    };

    return range;
  };

  return {
    loadText: loadText,
    getFullscreenQuad: getFullscreenQuad,
    createTexture: createTexture,
    createFramebuffer: createFramebuffer,
    createRawRenderState: createRawRenderState,
    viewRectangleToLonLatRange: viewRectangleToLonLatRange,
  };
})();
// 该类文件基本不做修改
// ...................................................................................
// 创建一个标准primitive类
// 该类文件基本不做修改
// import {Util} from "./util.js"
// ...................................................................................
// 创建一个标准primitive类
class CustomPrimitive {
  // 构造函数定义
  constructor(options) {
    // 命令类型
    this.commandType = options.commandType;
    // 几何要素
    this.geometry = options.geometry;
    // 属性位置
    this.attributeLocations = options.attributeLocations;
    // 图元类型
    this.primitiveType = options.primitiveType;

    // 统一映射
    this.uniformMap = options.uniformMap;

    // 顶点着色器源
    this.vertexShaderSource = options.vertexShaderSource;
    // 片元着色器源
    this.fragmentShaderSource = options.fragmentShaderSource;

    // 初始渲染状态
    this.rawRenderState = options.rawRenderState;
    // 帧缓冲区
    this.framebuffer = options.framebuffer;

    // 输出纹理
    this.outputTexture = options.outputTexture;

    // 自动清除
    this.autoClear = Cesium.defaultValue(options.autoClear, false);
    // 提前执行
    this.preExecute = options.preExecute;

    // 是否显示
    this.show = true;
    // 执行命令
    this.commandToExecute = undefined;
    // 清除命令
    this.clearCommand = undefined;
    // 如果启用了自动清除功能
    if (this.autoClear) {
      this.clearCommand = new Cesium.ClearCommand({
        // 清除颜色缓冲区的值
        color: new Cesium.Color(0.0, 0.0, 0.0, 0.0),
        // 清除深度缓冲区的值
        depth: 1.0,
        // 清除帧缓冲区的值
        framebuffer: this.framebuffer,
        // 渲染过程（不透明的颜色传递）
        pass: Cesium.Pass.OPAQUE,
      });
    }
  }

  // 命令创建
  createCommand(context) {
    // 根据命令类型，执行不同操作
    switch (this.commandType) {
      // “画”命令
      case 'Draw': {
        // 创建顶点数组
        var vertexArray = Cesium.VertexArray.fromGeometry({
          // canvas上下文对象
          context: context,
          // 包含用于创建顶点数组的数据的源几何
          geometry: this.geometry,
          // 将几何属性名称映射到顶点着色器属性位置的对象
          attributeLocations: this.attributeLocations,
          // 顶点数组缓冲区的预期使用模式
          bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
        });

        //创建着色器项目
        var shaderProgram = Cesium.ShaderProgram.fromCache({
          // canvas上下文对象
          context: context,
          // 顶点属性位置
          attributeLocations: this.attributeLocations,
          // 顶点着色器源
          vertexShaderSource: this.vertexShaderSource,
          // 片元着色器源
          fragmentShaderSource: this.fragmentShaderSource,
        });

        // 设置渲染初始状态
        var renderState = Cesium.RenderState.fromCache(this.rawRenderState);

        // 返回绘制命令对象
        return new Cesium.DrawCommand({
          // 该命令的创建者
          owner: this,
          // 顶点数组
          vertexArray: vertexArray,
          // 顶点数组中的图元类型
          primitiveType: this.primitiveType,
          //将js的函数传给webgl着色器
          uniformMap: this.uniformMap,
          // 影响绘制对象的位置、缩放比等（此处初始化为单位矩阵）
          modelMatrix: Cesium.Matrix4.IDENTITY,
          // 着色器程序
          shaderProgram: shaderProgram,
          // 绘制到的帧缓冲区(可能与GL_RGB5_A1相关)
          framebuffer: this.framebuffer,
          // 渲染状态
          renderState: renderState,
          // 指明渲染所在的步骤
          pass: Cesium.Pass.OPAQUE,
        });
      }
      // “计算”命令
      case 'Compute': {
        return new Cesium.ComputeCommand({
          // 执行命令的创建者
          owner: this,
          // 片元着色器
          fragmentShaderSource: this.fragmentShaderSource,
          // 统一映射
          uniformMap: this.uniformMap,
          // 输出纹理(可能与GL_RGB5_A1相关)
          outputTexture: this.outputTexture,
          // 渲染之后是否保留资源
          persists: true,
        });
      }
    }
  }
  // 设置几何
  setGeometry(context, geometry) {
    this.geometry = geometry;
    // 从几何创建顶点数组
    var vertexArray = Cesium.VertexArray.fromGeometry({
      // canvas上下文对象
      context: context,
      geometry: this.geometry,
      // 顶点属性位置（attribute变量的名称）
      attributeLocations: this.attributeLocations,
      // 定义缓存的使用形式
      bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
    });
    // commandToExecute.vertexArray变量赋值
    this.commandToExecute.vertexArray = vertexArray;
  }
  // 渲染的每一帧都会调用该函数
  update(frameState) {
    // 判断当前是否显示
    if (!this.show) {
      return;
    }
    // 判断变量commandToExecute是否有定义
    if (!Cesium.defined(this.commandToExecute)) {
      // 创建命令
      this.commandToExecute = this.createCommand(frameState.context);
    }
    // 判断变量preExecute是否有定义
    if (Cesium.defined(this.preExecute)) {
      this.preExecute();
    }
    // 判断变量clearCommand是否有定义
    if (Cesium.defined(this.clearCommand)) {
      // 帧状态中的命令列表添加元素
      frameState.commandList.push(this.clearCommand);
    }
    // // 帧状态中的命令列表添加元素
    frameState.commandList.push(this.commandToExecute);
  }
  // 是否销毁
  isDestroyed() {
    return false;
  }
  // 销毁
  destroy() {
    // 判断变量commandToExecute是否有定义
    if (Cesium.defined(this.commandToExecute)) {
      this.commandToExecute.shaderProgram =
        this.commandToExecute.shaderProgram && this.commandToExecute.shaderProgram.destroy();
    }
    // 销毁该实例
    return Cesium.destroyObject(this);
  }
}

// ...................................................................................
// 创建一个计算粒子的类
class ParticlesComputing {
  // 构造函数
  constructor(context, data, userInput, viewerParameters) {
    this.createWindTextures(context, data);
    this.createParticlesTextures(context, userInput, viewerParameters, data);
    this.createComputingPrimitives(data, userInput, viewerParameters);
  }
  //根据经纬度的索引行列号获取速度值
  getSpeedById(data, lonId, latId) {
    return {
      U: data.U.array[latId * data.dimensions.lon + lonId],
      V: data.V.array[latId * data.dimensions.lon + lonId],
    };
  }
  //根据经纬度的索引号获取经纬度坐标
  getLonLatById(data, lonId, latId) {
    return {
      lon: data.lon.array[lonId],
      lat: data.lat.array[latId],
    };
  }
  //获取当前位置的速度值
  getSpeedByLonLat(data, particleLocation) {
    // 计算数据在经度和纬度方向上的分辨率
    let interval = {};
    interval.lon = (data.lon.max - data.lon.min) / (data.dimensions.lon - 1);
    interval.lat = (data.lat.max - data.lat.min) / (data.dimensions.lat - 1);
    // 获取当前位置周围四个点的索引（行列号）
    let lon0 = Math.floor((particleLocation.lon - data.lon.min) / interval.lon);
    let lon1 = lon0 + 1;
    let lat0 = Math.floor((particleLocation.lat - data.lat.min) / interval.lat);
    let lat1 = lat0 + 1;
    // 获取这四个点的值
    let lon0_lat0 = [this.getSpeedById(data, lon0, lat0), this.getLonLatById(data, lon0, lat0)];
    let lon0_lat1 = [this.getSpeedById(data, lon0, lat1), this.getLonLatById(data, lon0, lat1)];
    let lon1_lat0 = [this.getSpeedById(data, lon1, lat0), this.getLonLatById(data, lon1, lat0)];
    let lon1_lat1 = [this.getSpeedById(data, lon1, lat1), this.getLonLatById(data, lon1, lat1)];
    let R1_U =
      ((lon1_lat0[1].lon - particleLocation.lon) / (lon1_lat0[1].lon - lon0_lat0[1].lon)) * lon1_lat0[0].U +
      ((particleLocation.lon - lon0_lat0[1].lon) / (lon1_lat0[1].lon - lon0_lat0[1].lon)) * lon1_lat0[0].U;
    let R2_U =
      ((lon1_lat1[1].lon - particleLocation.lon) / (lon1_lat1[1].lon - lon0_lat1[1].lon)) * lon1_lat1[0].U +
      ((particleLocation.lon - lon0_lat1[1].lon) / (lon1_lat1[1].lon - lon0_lat1[1].lon)) * lon1_lat0[0].U;
    let P_U =
      ((lon1_lat1[1].lat - particleLocation.lat) / (lon1_lat1[1].lat - lon1_lat0[1].lat)) * R2_U +
      ((particleLocation.lat - lon1_lat0[1].lat) / (lon1_lat1[1].lat - lon1_lat0[1].lat)) * R1_U;

    let R1_V =
      ((lon1_lat0[1].lon - particleLocation.lon) / (lon1_lat0[1].lon - lon0_lat0[1].lon)) * lon1_lat0[0].V +
      ((particleLocation.lon - lon0_lat0[1].lon) / (lon1_lat0[1].lon - lon0_lat0[1].lon)) * lon0_lat0[0].V;
    let R2_V =
      ((lon1_lat1[1].lon - particleLocation.lon) / (lon1_lat1[1].lon - lon0_lat1[1].lon)) * lon1_lat1[0].V +
      ((particleLocation.lon - lon0_lat1[1].lon) / (lon1_lat1[1].lon - lon0_lat1[1].lon)) * lon1_lat0[0].V;
    let P_V =
      ((lon1_lat1[1].lat - particleLocation.lat) / (lon1_lat1[1].lat - lon1_lat0[1].lat)) * R2_V +
      ((particleLocation.lat - lon1_lat0[1].lat) / (lon1_lat1[1].lat - lon1_lat0[1].lat)) * R1_V;
    return {
      U: P_U,
      V: P_V,
    };
  }
  // 创建随机粒子
  randomizeParticles(maxParticles, data, viewerParameters) {
    // 初始化一个数组
    var array = new Float32Array(4 * maxParticles);
    for (var i = 0; i < maxParticles; i++) {
      let particleLocation = {
        // "lon": Cesium.Math.randomBetween(data.lon.min, data.lon.max),
        // "lat": Cesium.Math.randomBetween(data.lat.min, data.lat.max),
        lev: Cesium.Math.randomBetween(data.lev.min, data.lev.max),
        lon: Cesium.Math.randomBetween(viewerParameters.lonRange.x, viewerParameters.lonRange.y),
        // "lat": Cesium.Math.randomBetween(viewerParameters.latRange.x, viewerParameters.latRange.y),
        lev: Cesium.Math.randomBetween(data.lev.min, data.lev.max),
      };
      while (true) {
        if (
          this.getSpeedByLonLat(data, particleLocation).U == 0 &&
          this.getSpeedByLonLat(data, particleLocation).U == 0
        ) {
          particleLocation = {
            // "lon": Cesium.Math.randomBetween(data.lon.min, data.lon.max),
            // "lat": Cesium.Math.randomBetween(data.lat.min, data.lat.max),
            lev: Cesium.Math.randomBetween(data.lev.min, data.lev.max),
            lon: Cesium.Math.randomBetween(viewerParameters.lonRange.x, viewerParameters.lonRange.y),
            lat: Cesium.Math.randomBetween(viewerParameters.latRange.x, viewerParameters.latRange.y),
            // "lev": Cesium.Math.randomBetween(data.lev.min, data.lev.max),
          };
        } else {
          break;
        }
      }
      // 四个点为一组，进行赋值
      array[4 * i] = Cesium.Math.randomBetween(viewerParameters.lonRange.x, viewerParameters.lonRange.y);
      array[4 * i + 1] = Cesium.Math.randomBetween(viewerParameters.latRange.x, viewerParameters.latRange.y);

      // array[4 * i] = Cesium.Math.randomBetween(data.lon.min, data.lon.max);
      // array[4 * i + 1] = Cesium.Math.randomBetween(data.lat.min, data.lat.max);
      array[4 * i + 2] = Cesium.Math.randomBetween(data.lev.min, data.lev.max);
      // array[4 * i + 3] = 0.0;
      // array[4 * i] = particleLocation.lon
      // array[4 * i + 1] = particleLocation.lat
      // array[4 * i + 2] = particleLocation.lev
      array[4 * i + 3] = 0.0;
    }
    return array;
  }
  // 创建流场的纹理
  createWindTextures(context, data) {
    // 流场纹理的可选项（可以不做修改）
    var windTextureOptions = {
      // canvas上下文对象
      context: context,
      // 宽度为经度数（此处为720）
      width: data.dimensions.lon,
      // 高度为纬度数（此处为361），lev值为1可忽略
      height: data.dimensions.lat * data.dimensions.lev,
      // 定义包含亮度通道的像素格式
      // pixelFormat: Cesium.PixelFormat.LUMINANCE,
      pixelFormat: Cesium.PixelFormat.RED,
      // 定义像素数据类型为浮点型
      pixelDatatype: Cesium.PixelDatatype.FLOAT,
      // ？？？
      flipY: false,
      // 定义采样器以采样纹理
      sampler: new Cesium.Sampler({
        // the values of texture will not be interpolated
        // 最近的纹理缩小过滤操作
        minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
        // 最近的纹理放大过滤操作
        magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST,
      }),
    };
    // 基于流的正北方向和正东方向创建流场纹理（流场纹理可选项，数据列表）
    this.windTextures = {
      U: Util.createTexture(windTextureOptions, data.U.array),
      V: Util.createTexture(windTextureOptions, data.V.array),
    };
  }

  // 创建粒子纹理
  createParticlesTextures(context, userInput, viewerParameters, data) {
    // 粒子纹理的可选项（可以不做修改）
    var particlesTextureOptions = {
      // canvas上下文对象
      context: context,
      // 宽度
      width: userInput.particlesTextureSize,
      // 高度
      height: userInput.particlesTextureSize,
      // 定义包含透明度的像素格式
      pixelFormat: Cesium.PixelFormat.RGBA,
      // 定义像素数据类型为浮点型
      pixelDatatype: Cesium.PixelDatatype.FLOAT,
      // ？？？
      flipY: false,
      // 定义采样器以采样纹理
      sampler: new Cesium.Sampler({
        // the values of texture will not be interpolated
        // 最近的纹理缩小过滤操作
        minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
        // 最近的纹理放大过滤操作
        magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST,
      }),
    };
    // 创建粒子数组(在范围内随机生成)
    var particlesArray = this.randomizeParticles(userInput.maxParticles, data, viewerParameters);
    // 创建一个与粒子数组长度相同的零数组
    var zeroArray = new Float32Array(4 * userInput.maxParticles).fill(0);
    // 创建粒子纹理
    this.particlesTextures = {
      // 前一个粒子的位置
      previousParticlesPosition: Util.createTexture(particlesTextureOptions, particlesArray),
      // 当前粒子的位置
      currentParticlesPosition: Util.createTexture(particlesTextureOptions, particlesArray),
      // 下一个粒子的位置
      nextParticlesPosition: Util.createTexture(particlesTextureOptions, particlesArray),
      // 粒子过程位置
      postProcessingPosition: Util.createTexture(particlesTextureOptions, particlesArray),
      // 粒子速度
      particlesSpeed: Util.createTexture(particlesTextureOptions, zeroArray),
    };
  }
  // 粒子纹理的销毁
  destroyParticlesTextures() {
    // 遍历particlesTextures中每一个key
    Object.keys(this.particlesTextures).forEach((key) => {
      // 依次进行销毁
      this.particlesTextures[key].destroy();
    });
  }

  // 创建计算图元
  createComputingPrimitives(data, userInput, viewerParameters) {
    // 构建三个三维坐标常量（笛卡尔坐标系）
    const dimension = new Cesium.Cartesian3(data.dimensions.lon, data.dimensions.lat, data.dimensions.lev);
    const minimum = new Cesium.Cartesian3(data.lon.min, data.lat.min, data.lev.min);
    const maximum = new Cesium.Cartesian3(data.lon.max, data.lat.max, data.lev.max);
    // 获取速度的最大值

    // 基于dimension、minimum和maximum构建一个三维坐标常量(相当于获得坐标的分辨率)
    const interval = new Cesium.Cartesian3(
      (maximum.x - minimum.x) / (dimension.x - 1),
      (maximum.y - minimum.y) / (dimension.y - 1),
      // z默认取1
      dimension.z > 1 ? (maximum.z - minimum.z) / (dimension.z - 1) : 1.0
    );

    // 构建两个二维坐标常量
    const uSpeedRange = new Cesium.Cartesian2(data.U.min, data.U.max);
    const vSpeedRange = new Cesium.Cartesian2(data.V.min, data.V.max);
    //
    const that = this;
    // 创建primitives对象
    this.primitives = {
      // 计算速度
      calculateSpeed: new CustomPrimitive({
        // 命令类型为“计算
        commandType: 'Compute',
        // 将数据传入着色器，以使用
        uniformMap: {
          // 获得流场数据U方向的纹理
          U: function () {
            return that.windTextures.U;
          },
          // 获得流场数据V方向的纹理
          V: function () {
            return that.windTextures.V;
          },
          // 获得当前粒子位置的纹理
          currentParticlesPosition: function () {
            return that.particlesTextures.currentParticlesPosition;
          },
          // 获得dimension三维坐标常量
          dimension: function () {
            return dimension;
          },
          // 获得minimum三维坐标常量
          minimum: function () {
            return minimum;
          },
          // 获得dmaximum三维坐标常量
          maximum: function () {
            return maximum;
          },
          // 获得interval三维坐标常量（坐标分辨率）
          interval: function () {
            return interval;
          },
          // 获得uSpeedRange二维坐标常量
          uSpeedRange: function () {
            return uSpeedRange;
          },
          // 获得vSpeedRange二维坐标常量
          vSpeedRange: function () {
            return vSpeedRange;
          },
          // 获得像素大小
          pixelSize: function () {
            return viewerParameters.pixelSize;
          },
          // 获得像素速度
          speedFactor: function () {
            return userInput.speedFactor;
          },
        },
        // 获得计算速度的片元着色器
        fragmentShaderSource: new Cesium.ShaderSource({
          sources: [Util.loadText('src/assets/glsl/calculateSpeed.frag')],
        }),
        // 输出粒子速度的纹理
        outputTexture: this.particlesTextures.particlesSpeed,

        preExecute: function () {
          // swap textures before binding
          var temp;
          // 获得前一个粒子位置的纹理
          temp = that.particlesTextures.previousParticlesPosition;
          // 粒子纹理的移动
          that.particlesTextures.previousParticlesPosition = that.particlesTextures.currentParticlesPosition;
          that.particlesTextures.currentParticlesPosition = that.particlesTextures.postProcessingPosition;
          that.particlesTextures.postProcessingPosition = temp;

          // keep the outputTexture up to date
          // 确保outputTexture是最新纹理
          that.primitives.calculateSpeed.commandToExecute.outputTexture = that.particlesTextures.particlesSpeed;
        },
      }),

      // 更新位置(不需要修改)
      updatePosition: new CustomPrimitive({
        // 命令类型为计算
        commandType: 'Compute',

        uniformMap: {
          // 获得当前粒子位置纹理
          currentParticlesPosition: function () {
            return that.particlesTextures.currentParticlesPosition;
          },
          // 获得粒子速度纹理（刚刚计算得到的）
          particlesSpeed: function () {
            return that.particlesTextures.particlesSpeed;
          },
        },
        // 片元着色器
        fragmentShaderSource: new Cesium.ShaderSource({
          sources: [Util.loadText('src/assets/glsl/updatePosition.frag')],
        }),
        outputTexture: this.particlesTextures.nextParticlesPosition,
        preExecute: function () {
          // keep the outputTexture up to date
          that.primitives.updatePosition.commandToExecute.outputTexture = that.particlesTextures.nextParticlesPosition;
        },
      }),

      // 用于判断粒子是否符合条件
      postProcessingPosition: new CustomPrimitive({
        commandType: 'Compute',
        uniformMap: {
          U: function () {
            return that.windTextures.U;
          },
          V: function () {
            return that.windTextures.V;
          },
          // 获得下一个粒子位置的纹理
          nextParticlesPosition: function () {
            return that.particlesTextures.nextParticlesPosition;
          },
          // 获得粒子速度纹理
          particlesSpeed: function () {
            return that.particlesTextures.particlesSpeed;
          },
          // 获得纬度范围
          lonRange: function () {
            return viewerParameters.lonRange;
          },
          // 获得minimum三维坐标常量
          minimum: function () {
            return minimum;
          },
          // 获得dmaximum三维坐标常量
          maximum: function () {
            return maximum;
          },
          // 获得interval三维坐标常量（坐标分辨率）
          interval: function () {
            return interval;
          },
          dimension: function () {
            return dimension;
          },
          // 获得经度范围
          latRange: function () {
            return viewerParameters.latRange;
          },
          // 获得随机系数（0~1）
          randomCoefficient: function () {
            var randomCoefficient = Math.random();
            return randomCoefficient;
          },
          // 获得销毁率
          dropRate: function () {
            return userInput.dropRate;
          },
          // 获得销毁率起伏
          dropRateBump: function () {
            return userInput.dropRateBump;
          },
        },
        // 片元着色器
        fragmentShaderSource: new Cesium.ShaderSource({
          sources: [Util.loadText('src/assets/glsl/postProcessingPosition.frag')],
        }),
        outputTexture: this.particlesTextures.postProcessingPosition,
        preExecute: function () {
          // keep the outputTexture up to date
          that.primitives.postProcessingPosition.commandToExecute.outputTexture =
            that.particlesTextures.postProcessingPosition;
        },
      }),
    };
  }
}

// ...................................................................................
// 构建粒子渲染类
class ParticlesRendering {
  // 构造函数定义
  constructor(context, data, userInput, viewerParameters, particlesComputing) {
    this.createRenderingTextures(context, data);
    this.createRenderingFramebuffers(context);
    this.createRenderingPrimitives(context, data, userInput, viewerParameters, particlesComputing);
  }

  // 不做修改
  createRenderingTextures(context, data) {
    // 创建颜色纹理选项
    const colorTextureOptions = {
      // canvas上下文对象
      context: context,
      width: context.drawingBufferWidth,
      height: context.drawingBufferHeight,
      // 定义包含透明度的像素格式
      pixelFormat: Cesium.PixelFormat.RGBA,
      // 定义像素数据类型为无符号字节
      pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
    };
    // 创建深度纹理选项
    const depthTextureOptions = {
      // canvas上下文对象
      context: context,
      width: context.drawingBufferWidth,
      height: context.drawingBufferHeight,
      // 定义包含深度值的像素格式
      pixelFormat: Cesium.PixelFormat.DEPTH_COMPONENT,
      // 定义像素数据类型为无符号整数
      pixelDatatype: Cesium.PixelDatatype.UNSIGNED_INT,
    };

    this.textures = {
      // 片段颜色纹理创建
      segmentsColor: Util.createTexture(colorTextureOptions),
      // 片段深度纹理创建
      segmentsDepth: Util.createTexture(depthTextureOptions),

      // 当前轨迹颜色纹理创建
      currentTrailsColor: Util.createTexture(colorTextureOptions),
      // 当前轨迹深度纹理创建
      currentTrailsDepth: Util.createTexture(depthTextureOptions),

      // 下一轨迹颜色纹理创建
      nextTrailsColor: Util.createTexture(colorTextureOptions),
      // 下一轨迹深度纹理创建
      nextTrailsDepth: Util.createTexture(depthTextureOptions),
    };
  }

  // 创建渲染帧缓存
  createRenderingFramebuffers(context) {
    this.framebuffers = {
      // 三个渲染帧缓存的创建
      segments: Util.createFramebuffer(context, this.textures.segmentsColor, this.textures.segmentsDepth),
      currentTrails: Util.createFramebuffer(
        context,
        this.textures.currentTrailsColor,
        this.textures.currentTrailsDepth
      ),
      nextTrails: Util.createFramebuffer(context, this.textures.nextTrailsColor, this.textures.nextTrailsDepth),
    };
  }

  // 创建片段几何
  createSegmentsGeometry(userInput) {
    // 指定重复顶点数为6(可修改)
    const repeatVertex = 6;
    // 创建一个空数组st(纹理坐标)
    var st = [];

    for (var s = 0; s < userInput.particlesTextureSize; s++) {
      for (var t = 0; t < userInput.particlesTextureSize; t++) {
        for (var i = 0; i < repeatVertex; i++) {
          st.push(s / userInput.particlesTextureSize);
          st.push(t / userInput.particlesTextureSize);
        }
      }
    }
    // 数组元素类型为float32
    st = new Float32Array(st);

    // 创建一个空数组normal(法线数据)
    var normal = [];

    const pointToUse = [-1, 0, 1];
    const offsetSign = [-1, 1];
    // 遍历maxParticles
    for (var i = 0; i < userInput.maxParticles; i++) {
      // 遍历pointToUse
      for (var j = 0; j < pointToUse.length; j++) {
        // 遍历offsetSign
        for (var k = 0; k < offsetSign.length; k++) {
          normal.push(pointToUse[j]);
          normal.push(offsetSign[k]);
          normal.push(0);
        }
      }
    }
    // 法线数组元素类型为float32
    normal = new Float32Array(normal);
    // 每一个粒子由四个三角形进行构建（6个顶点）
    const indexSize = 12 * userInput.maxParticles;
    // 顶点的索引
    var vertexIndexes = new Uint32Array(indexSize);
    // 顶点索引数组的构建
    for (var i = 0, j = 0, vertex = 0; i < userInput.maxParticles; i++) {
      vertexIndexes[j++] = vertex + 0;
      vertexIndexes[j++] = vertex + 1;
      vertexIndexes[j++] = vertex + 2;

      vertexIndexes[j++] = vertex + 2;
      vertexIndexes[j++] = vertex + 1;
      vertexIndexes[j++] = vertex + 3;

      vertexIndexes[j++] = vertex + 2;
      vertexIndexes[j++] = vertex + 4;
      vertexIndexes[j++] = vertex + 3;

      vertexIndexes[j++] = vertex + 4;
      vertexIndexes[j++] = vertex + 3;
      vertexIndexes[j++] = vertex + 5;

      vertex += repeatVertex;
    }

    //创建一个几何
    var geometry = new Cesium.Geometry({
      // 顶点属性
      attributes: new Cesium.GeometryAttributes({
        // 纹理坐标
        st: new Cesium.GeometryAttribute({
          componentDatatype: Cesium.ComponentDatatype.FLOAT,
          componentsPerAttribute: 2,
          values: st,
        }),
        // 法线属性
        normal: new Cesium.GeometryAttribute({
          componentDatatype: Cesium.ComponentDatatype.FLOAT,
          componentsPerAttribute: 3,
          values: normal,
        }),
      }),
      // 顶点索引（三个顶点构建一个三角形，一个粒子有四个三角形构建）
      indices: vertexIndexes,
    });
    return geometry;
  }

  // 创建渲染的Primitives
  createRenderingPrimitives(context, data, userInput, viewerParameters, particlesComputing) {
    const that = this;

    // 构建三个三维坐标常量（笛卡尔坐标系）
    const dimension = new Cesium.Cartesian3(data.dimensions.lon, data.dimensions.lat, data.dimensions.lev);
    const minimum = new Cesium.Cartesian3(data.lon.min, data.lat.min, data.lev.min);
    const maximum = new Cesium.Cartesian3(data.lon.max, data.lat.max, data.lev.max);
    // 获取速度的最大值
    const maxSpeed_U = Math.abs(data.U.max) > Math.abs(data.U.min) ? Math.abs(data.U.max) : Math.abs(data.U.min);
    const maxSpeed_V = Math.abs(data.V.max) > Math.abs(data.V.min) ? Math.abs(data.V.max) : Math.abs(data.V.min);
    const maxSpeed = Math.sqrt(Math.pow(maxSpeed_U, 2) + Math.pow(maxSpeed_V, 2));
    // 流场纹理的可选项（可以不做修改）
    var windTextureOptions = {
      // canvas上下文对象
      context: context,
      // 宽度为经度数（此处为720）
      width: data.dimensions.lon,
      // 高度为纬度数（此处为361），lev值为1可忽略
      height: data.dimensions.lat * data.dimensions.lev,
      // 定义包含亮度通道的像素格式
      // pixelFormat: Cesium.PixelFormat.LUMINANCE,
      pixelFormat: Cesium.PixelFormat.RED,
      // 定义像素数据类型为浮点型
      pixelDatatype: Cesium.PixelDatatype.FLOAT,
      // ？？？
      flipY: false,
      // 定义采样器以采样纹理
      sampler: new Cesium.Sampler({
        // the values of texture will not be interpolated
        // 最近的纹理缩小过滤操作
        minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
        // 最近的纹理放大过滤操作
        magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST,
      }),
    };
    this.windTextures = {
      U: Util.createTexture(windTextureOptions, data.U.array),
      V: Util.createTexture(windTextureOptions, data.V.array),
    };
    // 基于dimension、minimum和maximum构建一个三维坐标常量(相当于获得坐标的分辨率)
    const interval = new Cesium.Cartesian3(
      (maximum.x - minimum.x) / (dimension.x - 1),
      (maximum.y - minimum.y) / (dimension.y - 1),
      // z默认取1
      dimension.z > 1 ? (maximum.z - minimum.z) / (dimension.z - 1) : 1.0
    );
    this.primitives = {
      // 每一个粒子片段的绘制
      segments: new CustomPrimitive({
        // 命令类型为绘制
        commandType: 'Draw',
        // 顶点属性位置（attribute变量的名称）
        attributeLocations: {
          st: 0,
          normal: 1,
        },
        // 几何创建
        geometry: this.createSegmentsGeometry(userInput),
        // 图元类型为三角形
        primitiveType: Cesium.PrimitiveType.TRIANGLES_STRIP,
        // primitiveType: Cesium.PrimitiveType.TRIANGLES,
        uniformMap: {
          U: function () {
            return that.windTextures.U;
          },
          V: function () {
            return that.windTextures.V;
          },
          maxSpeed: function () {
            return maxSpeed;
          },
          // 获得minimum三维坐标常量
          minimum: function () {
            return minimum;
          },
          // 获得dmaximum三维坐标常量
          maximum: function () {
            return maximum;
          },
          // 获得interval三维坐标常量（坐标分辨率）
          interval: function () {
            return interval;
          },
          dimension: function () {
            return dimension;
          },
          previousParticlesPosition: function () {
            return particlesComputing.particlesTextures.previousParticlesPosition;
          },
          currentParticlesPosition: function () {
            return particlesComputing.particlesTextures.currentParticlesPosition;
          },
          postProcessingPosition: function () {
            return particlesComputing.particlesTextures.postProcessingPosition;
          },
          aspect: function () {
            return context.drawingBufferWidth / context.drawingBufferHeight;
          },
          pixelSize: function () {
            return viewerParameters.pixelSize;
          },
          lineWidth: function () {
            return userInput.lineWidth;
          },
          particleHeight: function () {
            return userInput.particleHeight;
          },
        },
        vertexShaderSource: new Cesium.ShaderSource({
          sources: [Util.loadText('src/assets/glsl/segmentDraw.vert')],
        }),
        fragmentShaderSource: new Cesium.ShaderSource({
          sources: [Util.loadText('src/assets/glsl/segmentDraw.frag')],
        }),
        // 创建初始渲染状态
        rawRenderState: Util.createRawRenderState({
          // undefined value means let Cesium deal with it
          viewport: undefined,
          depthTest: {
            enabled: true,
          },
          depthMask: true,
        }),
        framebuffer: this.framebuffers.segments,
        autoClear: true,
      }),
      // 范围内轨迹的绘制
      trails: new CustomPrimitive({
        // 命令类型为绘制
        commandType: 'Draw',
        attributeLocations: {
          position: 0,
          st: 1,
        },
        geometry: Util.getFullscreenQuad(),
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        uniformMap: {
          segmentsColorTexture: function () {
            return that.textures.segmentsColor;
          },
          segmentsDepthTexture: function () {
            return that.textures.segmentsDepth;
          },
          currentTrailsColor: function () {
            return that.framebuffers.currentTrails.getColorTexture(0);
          },
          trailsDepthTexture: function () {
            return that.framebuffers.currentTrails.depthTexture;
          },
          fadeOpacity: function () {
            return userInput.fadeOpacity;
          },
        },
        // prevent Cesium from writing depth because the depth here should be written manually
        vertexShaderSource: new Cesium.ShaderSource({
          defines: ['DISABLE_GL_POSITION_LOG_DEPTH'],
          sources: [Util.loadText('/src/assets/glsl/fullscreen.vert')],
        }),
        fragmentShaderSource: new Cesium.ShaderSource({
          defines: ['DISABLE_LOG_DEPTH_FRAGMENT_WRITE'],
          sources: [Util.loadText('src/assets/glsl/trailDraw.frag')],
        }),
        rawRenderState: Util.createRawRenderState({
          viewport: undefined,
          depthTest: {
            enabled: true,
            func: Cesium.DepthFunction.ALWAYS, // always pass depth test for full control of depth information
          },
          depthMask: true,
        }),
        framebuffer: this.framebuffers.nextTrails,
        autoClear: true,
        preExecute: function () {
          // swap framebuffers before binding
          var temp;
          temp = that.framebuffers.currentTrails;
          that.framebuffers.currentTrails = that.framebuffers.nextTrails;
          that.framebuffers.nextTrails = temp;

          // keep the framebuffers up to date
          that.primitives.trails.commandToExecute.framebuffer = that.framebuffers.nextTrails;
          that.primitives.trails.clearCommand.framebuffer = that.framebuffers.nextTrails;
        },
      }),
      // 屏幕绘制
      screen: new CustomPrimitive({
        commandType: 'Draw',
        attributeLocations: {
          position: 0,
          st: 1,
        },
        geometry: Util.getFullscreenQuad(),
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        uniformMap: {
          trailsColorTexture: function () {
            return that.framebuffers.nextTrails.getColorTexture(0);
          },
          trailsDepthTexture: function () {
            return that.framebuffers.nextTrails.depthTexture;
          },
        },
        // prevent Cesium from writing depth because the depth here should be written manually
        vertexShaderSource: new Cesium.ShaderSource({
          defines: ['DISABLE_GL_POSITION_LOG_DEPTH'],
          sources: [Util.loadText('src/assets/glsl/fullscreen.vert')],
        }),
        fragmentShaderSource: new Cesium.ShaderSource({
          defines: ['DISABLE_LOG_DEPTH_FRAGMENT_WRITE'],
          sources: [Util.loadText('src/assets/glsl/screenDraw.frag')],
        }),
        rawRenderState: Util.createRawRenderState({
          viewport: undefined,
          depthTest: {
            enabled: false,
          },
          depthMask: true,
          blending: {
            enabled: true,
          },
        }),
        framebuffer: undefined, // undefined value means let Cesium deal with it
      }),
    };
  }
}

//....................................................................................
// 粒子系统类
class ParticleSystem {
  constructor(context, data, userInput = {}, viewerParameters) {
    // 上下文对象
    this.context = context;
    this.data = data;
    this.userInput = userInput;
    this.viewerParameters = viewerParameters;

    // 粒子计算对象
    this.particlesComputing = new ParticlesComputing(this.context, this.data, this.userInput, this.viewerParameters);
    // 粒子渲染对象
    this.particlesRendering = new ParticlesRendering(
      this.context,
      this.data,
      this.userInput,
      this.viewerParameters,
      this.particlesComputing
    );
  }

  // 重新绘制
  canvasResize(context) {
    // 销毁粒子纹理
    this.particlesComputing.destroyParticlesTextures();
    // 遍历流场纹理，并销毁
    Object.keys(this.particlesComputing.windTextures).forEach((key) => {
      this.particlesComputing.windTextures[key].destroy();
    });
    // 遍历帧缓存对象，并销毁
    Object.keys(this.particlesRendering.framebuffers).forEach((key) => {
      this.particlesRendering.framebuffers[key].destroy();
    });
    // 上下文对象获取
    this.context = context;
    // 创建粒子计算对象
    this.particlesComputing = new ParticlesComputing(this.context, this.data, this.userInput, this.viewerParameters);
    // 创建粒子渲染对象
    this.particlesRendering = new ParticlesRendering(
      this.context,
      this.data,
      this.userInput,
      this.viewerParameters,
      this.particlesComputing
    );
  }

  //清空帧缓存
  clearFramebuffers() {
    var clearCommand = new Cesium.ClearCommand({
      color: new Cesium.Color(0.0, 0.0, 0.0, 0.0),
      depth: 1.0,
      // framebuffer不赋值
      framebuffer: undefined,
      pass: Cesium.Pass.OPAQUE,
    });
    // 遍历每一个framebuffer（有三个）
    Object.keys(this.particlesRendering.framebuffers).forEach((key) => {
      clearCommand.framebuffer = this.particlesRendering.framebuffers[key];
      // 执行清空操作
      clearCommand.execute(this.context);
    });
  }

  // 刷新粒子
  refreshParticles(maxParticlesChanged) {
    // 清空帧缓存
    this.clearFramebuffers();
    // 清空粒子纹理
    this.particlesComputing.destroyParticlesTextures();
    // 重新创建粒子纹理
    this.particlesComputing.createParticlesTextures(this.context, this.userInput, this.viewerParameters, this.data);

    // 如果maxParticlesChanged为True
    if (maxParticlesChanged) {
      // 创建片段几何
      var geometry = this.particlesRendering.createSegmentsGeometry(this.userInput);
      this.particlesRendering.primitives.segments.geometry = geometry;
      var vertexArray = Cesium.VertexArray.fromGeometry({
        context: this.context,
        geometry: geometry,
        attributeLocations: this.particlesRendering.primitives.segments.attributeLocations,
        bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
      });
      this.particlesRendering.primitives.segments.commandToExecute.vertexArray = vertexArray;
    }
  }

  applyUserInput(userInput) {
    var maxParticlesChanged = false;
    // 如果maxParticles改变
    if (this.userInput.maxParticles != userInput.maxParticles) {
      maxParticlesChanged = true;
    }
    // 遍历userInput
    Object.keys(userInput).forEach((key) => {
      // 更新userInput
      this.userInput[key] = userInput[key];
    });
    // 粒子刷新
    this.refreshParticles(maxParticlesChanged);
  }

  applyViewerParameters(viewerParameters) {
    Object.keys(viewerParameters).forEach((key) => {
      // 更新viewerParameters
      this.viewerParameters[key] = viewerParameters[key];
    });
    // 粒子刷新，但是不重新渲染粒子
    this.refreshParticles(false);
  }
}

export { Util, ParticleSystem };
