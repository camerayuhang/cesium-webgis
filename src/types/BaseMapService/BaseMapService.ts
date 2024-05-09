class BaseMapService {
  viewer: Cesium.Viewer;
  scene: Cesium.Scene;
  canvas: HTMLCanvasElement;
  // baseLayerPicker: Cesium.BaseLayerPicker;
  imageryViewModels: Array<Cesium.ProviderViewModel>;
  terrainViewModels: Array<Cesium.ProviderViewModel>;
  tianKey = '208b5256e3d10046ff51e4eaabbb9bb8';
  container: HTMLElement;

  constructor(viewer: Cesium.Viewer, container: HTMLElement) {
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.canvas = viewer.canvas;
    // this.viewModel = this.viewer.baseLayerPicker.viewModel;
    this.imageryViewModels = [];
    this.terrainViewModels = [];
    this.container = container;
  }

  async initBaseMap() {
    this.initMapboxBaseMap();
    this.initTianBaseMap();
    await this.initTerrain();
    const baseLayerPicker = new Cesium.BaseLayerPicker(this.container, {
      globe: this.scene.globe,
      imageryProviderViewModels: this.imageryViewModels,
      terrainProviderViewModels: this.terrainViewModels,
    });
    baseLayerPicker.viewModel.selectedImagery = this.imageryViewModels[1];
    baseLayerPicker.viewModel.selectedTerrain = this.terrainViewModels[0];
    // console.log(this.viewer.baseLayerPicker.viewModel.terrainProviderViewModels);
  }

  initMapboxBaseMap() {
    // Mapbox tile provider
    const mapboxlayer = new Cesium.MapboxStyleImageryProvider({
      styleId: 'clbrqirmf000715o2tk1dv26u',
      username: 'camerayuhang',
      accessToken: 'pk.eyJ1IjoiY2FtZXJheXVoYW5nIiwiYSI6ImNsYnJwMmt1eDFmaGMzcHBsMHl1dXpqOW0ifQ.voxLAF6gSmGJKrhDNsYGGw',
    });

    const mapboxSatelite = new Cesium.MapboxStyleImageryProvider({
      styleId: 'clkanvpo100a801pqg9td9kc1',
      username: 'camerayuhang',
      accessToken: 'pk.eyJ1IjoiY2FtZXJheXVoYW5nIiwiYSI6ImNsYnJwMmt1eDFmaGMzcHBsMHl1dXpqOW0ifQ.voxLAF6gSmGJKrhDNsYGGw',
    });

    const mapboxSteetViewModel = new Cesium.ProviderViewModel({
      name: 'Mapbox street',
      iconUrl:
        'data:image/webp;base64,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',
      tooltip: 'mapbox服务',
      category: 'My basemap',
      creationFunction: () => {
        return mapboxlayer;
      },
    });

    const mapboxSateliteViewModel = new Cesium.ProviderViewModel({
      name: 'Mapbox satelite',
      iconUrl:
        'data:image/webp;base64,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',
      tooltip: 'mapbox服务',
      category: 'My basemap',
      creationFunction: () => {
        return mapboxSatelite;
      },
    });

    this.imageryViewModels.push(mapboxSteetViewModel);
    this.imageryViewModels.push(mapboxSateliteViewModel);
  }

  initTianBaseMap() {
    const tdtVecBasicLayer = new Cesium.WebMapTileServiceImageryProvider({
      url:
        'http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=' +
        this.tianKey,
      layer: 'tdtVecBasicLayer',
      style: 'default',
      format: 'image/jpeg',
      tileMatrixSetID: 'GoogleMapsCompatible',
    });

    const tdtVecAnnoLayer = new Cesium.WebMapTileServiceImageryProvider({
      url:
        'http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=' +
        this.tianKey,
      layer: 'tdtAnnoLayer',
      style: 'default',
      format: 'image/jpeg',
      tileMatrixSetID: 'GoogleMapsCompatible',
    });

    const tdtBasicLayer = new Cesium.WebMapTileServiceImageryProvider({
      url:
        'http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=' +
        this.tianKey,
      layer: 'tdtBasicLayer',
      style: 'default',
      format: 'image/jpeg',
      tileMatrixSetID: 'GoogleMapsCompatible',
    });

    const tdtAnnoLayer = new Cesium.WebMapTileServiceImageryProvider({
      url:
        'http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=' +
        this.tianKey,
      layer: 'tdtAnnoLayer',
      style: 'default',
      format: 'image/jpeg',
      tileMatrixSetID: 'GoogleMapsCompatible',
    });

    const tianVectorViewModel = new Cesium.ProviderViewModel({
      name: 'Tian vector',
      iconUrl: 'http://lbs.tianditu.gov.cn/images/vec_c.png',
      tooltip: '天地图服务',
      category: 'My basemap',
      creationFunction: () => {
        return [tdtVecBasicLayer, tdtVecAnnoLayer];
      },
    });

    const tianImageryViewModel = new Cesium.ProviderViewModel({
      name: 'Tian Imagery',
      iconUrl: 'http://lbs.tianditu.gov.cn/images/img_c.png',
      tooltip: '天地图服务',
      category: 'My basemap',
      creationFunction: () => {
        return [tdtBasicLayer, tdtAnnoLayer];
      },
    });

    this.imageryViewModels.push(tianVectorViewModel);
    this.imageryViewModels.push(tianImageryViewModel);
  }

  async initTerrain() {
    const ellipsoidTerrainProvider = new Cesium.EllipsoidTerrainProvider();
    const cesiumTerrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1, {
      requestWaterMask: true,
      requestVertexNormals: true,
    });

    const ellipsoidTerrainViewModel = new Cesium.ProviderViewModel({
      name: 'WGS84 Ellipsoid',
      iconUrl: '/node_modules/cesium/Build/CesiumUnminified/Widgets/Images/TerrainProviders/Ellipsoid.png',
      tooltip: 'WGS84 standard ellipsoid, also known as EPSG:4326',
      category: 'My terrains',
      creationFunction: () => {
        return ellipsoidTerrainProvider;
      },
    });

    const cesiumTerrainViewModel = new Cesium.ProviderViewModel({
      iconUrl: '/node_modules/cesium/Build/CesiumUnminified/Widgets/Images/TerrainProviders/CesiumWorldTerrain.png',
      name: 'Cesium World Terrain',
      tooltip: 'High-resolution global terrain tileset curated from several datasources and hosted by Cesium ion',
      category: 'My terrains',

      creationFunction: () => {
        return cesiumTerrainProvider;
      },
    });

    this.terrainViewModels.push(ellipsoidTerrainViewModel);
    this.terrainViewModels.push(cesiumTerrainViewModel);
  }
}

export { BaseMapService };