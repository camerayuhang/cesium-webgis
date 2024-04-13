<template>
  <q-card
    class="placemark-panel absolute-center z-top"
    :style="{
      top: placemarkStore.position.top + 'px',
      left: placemarkStore.position.left + 'px',
      minWidth: 300 + 'px',
      maxHeight: 60 + 'vh',
    }"
    v-show="placemarkStore.visible"
  >
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">New Placemark</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup @click="cancelHandler" />
    </q-card-section>
    <q-card-section>
      <q-input v-model="placemarkStore.currentPlacemark.id" label="id" dense disable />
      <q-input v-model="placemarkStore.currentPlacemark.name" label="name" dense />
      <q-input v-model="placemarkStore.currentPlacemark.latitude" label="latitude" dense disable />
      <q-input v-model="placemarkStore.currentPlacemark.longitude" label="longitude" dense disable />
      <q-input v-model="placemarkStore.currentPlacemark.description" label="description" dense type="textarea" />
    </q-card-section>
    <q-card-section>
      <q-file
        dense
        filled
        v-model="fileRef"
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
          <q-icon name="attachment" />
        </template>
      </q-file>
      <q-img
        dense
        v-if="placemarkStore.currentPlacemark.url !== null"
        :src="placemarkStore.currentPlacemark.url"
        :ratio="1"
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
import { usePlacemarkStore } from 'src/stores/PlacemarkStore';
import { imageToUrl } from 'src/tools/utils';
import { reactive, ref } from 'vue';

const placemarkStore = usePlacemarkStore();

const fileRef = ref<File | null>(null);

const fileSelectedHandler = (file: File) => {
  placemarkStore.currentPlacemark.url = imageToUrl(file);
};

const savePlacemarkInfo = () => {
  placemarkStore.updatePlacemarkArray(placemarkStore.currentPlacemark.id);
  cancelHandler();
};

const cancelHandler = () => {
  placemarkStore.visible = false;
};
</script>

<style lang="scss" scoped>
.placemark-panel {
  overflow: scroll;
}
</style>
