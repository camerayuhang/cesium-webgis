<template>
  <q-item>
    <q-btn square color="primary" icon="edit_location" label="Add Placemark" @click="addPlaceMark" />
  </q-item>
</template>
<script setup lang="ts">
import { useVueCesium } from 'vue-cesium';
import { usePlacemarkStore } from 'src/stores/PlacemarkStore';
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { PlacemarkService } from 'src/types/PlacemarkService/PlacemarkService';

const placemarkStore = usePlacemarkStore();

const vcViewer = useVueCesium();
const viewer = vcViewer.viewer;

const placemarkService = new PlacemarkService(viewer, placemarkStore.placemarkArray);

placemarkService.emitter.on('placemark-panel-visibility', (e) => {
  placemarkStore.visible = e.visible;
  if (e.id) {
    placemarkStore.setCurrentPlacemarkById(e.id);
  }
});

const addPlaceMark = () => {
  placemarkService.hideNewPlacemarkPanel();
  placemarkService.removeScreenSpaceEvent();

  placemarkService.setPlacemarkMovingAction();
  placemarkService.setPlacemarkAddedAction();
};

const { visible } = storeToRefs(placemarkStore);

watch(visible, () => {
  if (!visible.value) {
    placemarkService.setPlacemarkSelectedAction();
    placemarkService.setCursorPointerAction();
    placemarkService.selectedPlacemark?.setDefaultStyle();
  }
});
</script>
