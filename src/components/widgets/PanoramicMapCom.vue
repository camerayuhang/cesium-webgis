<template>
  <div class="panoramic-map-panel absolute z-top">
    <div class="panoramic-map-overlay fit absolute cursor-pointer" @click="onPanoramicMapClick"></div>
    <iframe :src="iframeUrl" scrolling="auto" class="fit"></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const iframeUrl = ref<string>('https://www.720yun.com/t/64vkbmiwspl?scene_id=95287900');

function onPanoramicMapClick(): void {
  window.open(iframeUrl.value);
}
</script>

<style scoped lang="scss">
.panoramic-map-panel {
  // background-color: red;
  width: 30vw;
  height: 30vh;
  right: 2vh;
  bottom: 12vh;
}
</style>
