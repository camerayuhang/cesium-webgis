class FloodAnalysis {
  positions: Array<Cesium.Cartesian3>;
  waterMinElevation: number;
  waterMaxElevation: number;
  floodEntity: Cesium.Entity;

  constructor(
    viewer: Cesium.Viewer,
    positions: Array<Cesium.Cartesian3>,
    waterMinElevation: number,
    waterMaxElevation: number
  ) {
    // 初始化属性
    this.positions = positions;
    this.waterMinElevation = waterMinElevation;
    this.waterMaxElevation = waterMaxElevation;
    this.floodEntity = viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions),
        extrudedHeight: new window.Cesium.CallbackProperty(() => {
          if (waterMinElevation < waterMaxElevation) {
            waterMinElevation += 0.1;
          }
          return waterMinElevation;
        }, false),
        material: window.Cesium.Color.fromCssColorString('#3D81A5').withAlpha(0.7),
      },
    });
  }
}

export { FloodAnalysis };
