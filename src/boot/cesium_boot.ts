import { boot } from 'quasar/wrappers';
import VueCesium from 'vue-cesium';

import 'vue-cesium/dist/index.css';

declare global {
  interface Window {
    CESIUM_BASE_URL: string;
  }
}

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app } /* { app, router, ... } */) => {
  app.use(VueCesium, {
    cesiumPath: 'node_modules/cesium/Build/CesiumUnminified/Cesium.js',
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMDRjYzAwNi03NDc3LTQ0YWQtYjEzOC1mZDMwNGI0YjYwMzciLCJpZCI6OTEyODAsImlhdCI6MTY1MDk1MTE3OX0.le9nlEZJur0SDWvxi9Hvd99cd3f61FfZKku4bC_gnsU',
  });

  // if (typeof (window as any).Ceisum === 'undefined') {
  //   (window as any).Ceisum = window
  // }
  // something to do
  // window.CESIUM_BASE_URL = 'node_modules/cesium/Build/CesiumUnminified/';
  // Cesium.Ion.defaultAccessToken =
  //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMDRjYzAwNi03NDc3LTQ0YWQtYjEzOC1mZDMwNGI0YjYwMzciLCJpZCI6OTEyODAsImlhdCI6MTY1MDk1MTE3OX0.le9nlEZJur0SDWvxi9Hvd99cd3f61FfZKku4bC_gnsU';
});
