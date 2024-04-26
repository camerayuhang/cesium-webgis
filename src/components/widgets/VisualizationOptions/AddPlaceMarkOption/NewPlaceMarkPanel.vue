<template>
  <q-card
    class="placemark-panel absolute-center"
    :style="{
      top: placemarkStore.placemarkForm.canvasPositionY as number - 60 + 'px',
      left: placemarkStore.placemarkForm.canvasPositionX as number + 180 + 'px',
      minWidth: 300 + 'px',
      maxHeight: 60 + 'vh',
      zIndex: 3000
    }"
    v-show="placemarkStore.visible"
  >
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">New Placemark</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup @click="cancelHandler" />
    </q-card-section>
    <q-card-section>
      <q-input v-model="placemarkStore.placemarkForm.id" label="id" dense disable />
      <q-input v-model="placemarkStore.placemarkForm.name" label="name" dense />
      <q-input v-model="placemarkStore.placemarkForm.latitude" label="latitude" dense disable />
      <q-input v-model="placemarkStore.placemarkForm.longitude" label="longitude" dense disable />
      <q-input v-model="placemarkStore.placemarkForm.description" label="description" dense type="textarea">
        <template v-slot:label> <q-icon name="edit_note" />description</template>
      </q-input>
    </q-card-section>
    <q-card-section>
      <q-file
        dense
        filled
        v-model="placemarkStore.placemarkForm.file"
        label="image"
        @update:model-value="fileSelectedHandler"
        accept=".jpg, image/*"
        :rules="[
          (val) => {
            return val != null || 'File is required';
          },
        ]"
        lazy-rules="ondemand"
      >
        <template v-slot:file="{ file }">{{ file.name }} </template>
        <template v-slot:prepend>
          <q-icon name="image" />
        </template>
        <template v-slot:append>
          <q-icon name="delete_forever" color="warning" @click.stop.prevent="clearImg" class="cursor-pointer" />
        </template>
      </q-file>

      <q-img
        dense
        :src="placemarkStore.image_url"
        :ratio="1"
        ref="qImgRef"
        class="q-mt-md"
        placeholder-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWBAMAAADOL2zRAAAAG1BMVEXMzMyWlpaqqqq3t7fFxcW+vr6xsbGjo6OcnJyLKnDGAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABAElEQVRoge3SMW+DMBiE4YsxJqMJtHOTITPeOsLQnaodGImEUMZEkZhRUqn92f0MaTubtfeMh/QGHANEREREREREREREtIJJ0xbH299kp8l8FaGtLdTQ19HjofxZlJ0m1+eBKZcikd9PWtXC5DoDotRO04B9YOvFIXmXLy2jEbiqE6Df7DTleA5socLqvEFVxtJyrpZFWz/pHM2CVte0lS8g2eDe6prOyqPglhzROL+Xye4tmT4WvRcQ2/m81p+/rdguOi8Hc5L/8Qk4vhZzy08DduGt9eVQyP2qoTM1zi0/uf4hvBWf5c77e69Gf798y08L7j0RERERERERERH9P99ZpSVRivB/rgAAAABJRU5ErkJggg=="
        fit="contain"
      />
    </q-card-section>

    <q-card-section class="row justify-end q-gutter-md no-wrap">
      <q-btn dark-percentage unelevated color="orange" text-color="grey-9" @click="savePlacemarkInfo">
        <div>OK</div></q-btn
      >

      <q-btn color="negative" @click="cancelHandler">
        <div>Cancel</div>
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { deletePlacemarkImageById, updatePlacemarkInfoById } from 'src/api/placemark_api';
import { usePlacemarkStore } from 'src/stores/PlacemarkStore';
import { getMediaDimension, imageToUrl } from 'src/tools/utils';
import { Placemark } from 'src/types/PlacemarkService/Placemark';
import { PlacemarkInfo } from 'src/types/PlacemarkService/PlacemarkInfo';
import { ref } from 'vue';
import { useVueCesium } from 'vue-cesium';

const viewer = useVueCesium().viewer;
const placemarkStore = usePlacemarkStore();

// const fileRef = ref<File | null>(null);
const qImgRef = ref();
const fileSelectedHandler = (file: File) => {
  placemarkStore.image_url = imageToUrl(file);
};

const savePlacemarkInfo = async () => {
  const id = placemarkStore.placemarkForm.id as string;
  const placemark = viewer.entities.getById(id) as Placemark;
  // const imgElement = qImgRef.value.$el.querySelector('img') as HTMLImageElement;
  // const { width, height } = getMediaDimension(imgElement);
  const propsToUpdate = {
    name: placemarkStore.placemarkForm.name,
    description: placemarkStore.placemarkForm.description,
    file: placemarkStore.placemarkForm.file,
  };
  await placemark.update(propsToUpdate);
  placemarkStore.image_url = placemark.info.placemark_image?.image;
  cancelHandler();

  // update placemark
  // const billboard = placemark.billboard as Cesium.BillboardGraphics;
  // (placemark.label as Cesium.LabelGraphics).text = new Cesium.ConstantProperty(placemarkStore.placemarkForm.name);
  // billboard.image = new Cesium.ConstantProperty(placemarkStore.placemarkForm.image_url);
  // billboard.width = new Cesium.ConstantProperty((100 * width) / height);
  // billboard.height = new Cesium.ConstantProperty(100);

  // update placemarkinfo stored in placemark
  // (placemark.info as PlacemarkInfo).name = placemarkStore.placemarkForm.name;
  // (placemark.info as PlacemarkInfo).description = placemarkStore.placemarkForm.description;
  // (placemark.info as PlacemarkInfo).image_url = placemarkStore.placemarkForm.image_url;

  // // update placemarkinfo on postgresql
  // updatePlacemarkInfoById(id, {
  //   name: placemarkStore.placemarkForm.name,
  //   description: placemarkStore.placemarkForm.description,
  //   image_url: placemarkStore.placemarkForm.image_url,
  // });

  // placemarkStore.updatePlacemarkArray(placemarkStore.placemarkForm.id);
};

const clearImg = async () => {
  if (placemarkStore.placemarkForm.placemark_image) {
    const placemarkId = placemarkStore.placemarkForm.id as string;
    const placemark = viewer.entities.getById(placemarkId) as Placemark;
    await placemark.clearPlacemarkImage();

    placemarkStore.placemarkForm.file = undefined;
    placemarkStore.image_url = undefined;
  }
};

const cancelHandler = () => {
  placemarkStore.visible = false;
  placemarkStore.placemarkForm.file = undefined;
};
</script>

<style lang="scss" scoped>
.placemark-panel {
  overflow: scroll;
}
</style>
