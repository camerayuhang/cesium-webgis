<template>
  <q-item>
    <q-item-section>
      <q-checkbox
        @update:model-value="initPlacemark"
        v-model="enableAddPlacemark"
        label="Placemark"
        v-show="!loading"
      />
    </q-item-section>
    <q-inner-loading
      :showing="loading"
      label="loading placemarks..."
      label-class="text-teal"
      label-style="font-size: 1.1em"
    />
  </q-item>
  <q-item>
    <q-btn
      square
      color="primary"
      icon="edit_location"
      label="Add Placemark"
      @click="addPlaceMark"
      :disable="!enableAddPlacemark || loading"
    />
  </q-item>
</template>
<script setup lang="ts">
import { useVueCesium } from 'vue-cesium';
import { usePlacemarkStore } from 'src/stores/PlacemarkStore';
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { PlacemarkService } from 'src/types/PlacemarkService/PlacemarkService';
import { createImgSrc } from 'src/tools/utils';
const loading = ref(false);
const enableAddPlacemark = ref(false);
const placemarkStore = usePlacemarkStore();
const vcViewer = useVueCesium();
const viewer = vcViewer.viewer;

const placemarkService = new PlacemarkService(viewer);

placemarkService.emitter.on('placemark-panel-visibility', (e) => {
  if (e.placemarkInfo) {
    // placemarkStore.setCurrentPlacemarkById(e.id);
    placemarkStore.placemarkForm = { ...e.placemarkInfo };
    if (e.placemarkInfo.placemark_image) {
      placemarkStore.image_url = createImgSrc(
        e.placemarkInfo.placemark_image.image,
        e.placemarkInfo.placemark_image.type
      );
    } else {
      placemarkStore.image_url = '';
    }
  }
  placemarkStore.visible = e.visible;
});

const initPlacemark = async (value: boolean) => {
  if (value) {
    loading.value = true;
    await placemarkService.createAllPlacemarks();
    placemarkService.setPlacemarkSelectedAction();
    placemarkService.setCursorPointerAction();
    loading.value = false;
  } else {
    await placemarkService.removeAllPlacemarks();
  }
};

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

onUnmounted(() => {
  if (placemarkService.movingPlacemark) {
    viewer.entities.remove(placemarkService.movingPlacemark);
  }
});
</script>
