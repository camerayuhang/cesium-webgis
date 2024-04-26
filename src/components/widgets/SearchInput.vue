<template>
  <q-menu class="z-top">
    <q-input v-model="searchLocation" label="Search for localization" placeholder="Enter location">
      <template v-slot:prepend> <q-icon name="search" size="md" /> </template
      ><template v-slot:after>
        <q-btn round dense flat icon="flight_takeoff" icon-size="md" @click="flyToLocation" /> </template
    ></q-input>
  </q-menu>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useVueCesium } from 'vue-cesium';
import axios from 'axios';
const viewer = useVueCesium().viewer;
const $q = useQuasar(); // 获取Quasar提供的全局API
const searchLocation = ref('');
const key = '74aa5965425dc555c52595fc4d1de59e';
const gaode2Wgs84 = (location: [number, number]): number[] => {
  const wgs84Location = [0, 0];
  wgs84Location[0] =
    location[0] - 0.0065 * Math.cos((location[1] * Math.PI) / 180) - 0.006 * Math.cos((location[0] * Math.PI) / 180);
  wgs84Location[1] = location[1] - 0.006 * Math.sin((location[0] * Math.PI) / 180);
  return wgs84Location;
};
const flyToLocation = async () => {
  try {
    const result = await axios.get(
      `https://restapi.amap.com/v3/geocode/geo?address=${searchLocation.value}&key=${key}`
    );
    const location = gaode2Wgs84(result.data.geocodes[0].location.split(',').map((str: string) => Number(str)));
    const cartesianPosition = Cesium.Cartesian3.fromDegrees(location[0], location[1]);
    const pointEntity = viewer.entities.add({
      position: cartesianPosition,
      billboard: {
        image: 'src/assets/img/location.png', // 替换为您的图标文件的实际路径
        scale: 0.5, // 图标缩放比例（可选）
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // 水平对齐方式（可选）
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 垂直对齐方式（可选）
      },
    });
    viewer.flyTo(pointEntity, {
      duration: 1.0, // 可选，飞行持续时间（秒）
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0), // 航向，这里设为正北（0度），也可以选择其他角度或保留默认值
        Cesium.Math.toRadians(-90), // 俯仰角设为-90度，即垂直向下
        5000
      ),
    });
    setTimeout(() => {
      viewer.entities.remove(pointEntity);
    }, 5000);
    $q.notify({
      message: 'Location success!',
      type: 'positive',
      position: 'top',
      timeout: 3000, // 自动关闭的延迟（毫秒）
    });
  } catch (error) {
    $q.notify({
      message: `Location error！${error}`,
      type: 'negative',
      position: 'top',
      timeout: 3000, // 自动关闭的延迟（毫秒）
    });
  }
};
</script>

<style scoped lang="scss"></style>
