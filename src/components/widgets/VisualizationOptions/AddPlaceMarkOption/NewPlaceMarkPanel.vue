<template>
  <q-card
    id="placemark-panel"
    ref="qCardRef"
    class="absolute"
    :style="{
      top: placemarkStore.canvasPosition.y + 'px',
      left: placemarkStore.canvasPosition.x + 'px',
      zIndex: 3000,
      visibility: placemarkStore.visible ? 'visible' : 'hidden',
    }"
  >
    <!-- <q-card-section class="row items-center q-pb-sm"> -->
    <q-toolbar class="bg-primary text-white glossy">
      <q-avatar rounded icon="add_location" size="xl"></q-avatar>
      <q-toolbar-title><span class="text-weight-bold">New Placemark</span></q-toolbar-title>
      <q-btn icon="close" flat round dense v-close-popup @click="cancelHandler" />
    </q-toolbar>
    <!-- <div class="text-h6"></div> -->
    <!-- <q-space /> -->
    <!-- </q-card-section> -->
    <q-scroll-area class="scroll-content">
      <div class="content">
        <q-img
          :src="placemarkStore.image_url"
          placeholder-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWBAMAAADOL2zRAAAAG1BMVEXMzMyWlpaqqqq3t7fFxcW+vr6xsbGjo6OcnJyLKnDGAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABAElEQVRoge3SMW+DMBiE4YsxJqMJtHOTITPeOsLQnaodGImEUMZEkZhRUqn92f0MaTubtfeMh/QGHANEREREREREREREtIJJ0xbH299kp8l8FaGtLdTQ19HjofxZlJ0m1+eBKZcikd9PWtXC5DoDotRO04B9YOvFIXmXLy2jEbiqE6Df7DTleA5socLqvEFVxtJyrpZFWz/pHM2CVte0lS8g2eDe6prOyqPglhzROL+Xye4tmT4WvRcQ2/m81p+/rdguOi8Hc5L/8Qk4vhZzy08DduGt9eVQyP2qoTM1zi0/uf4hvBWf5c77e69Gf798y08L7j0RERERERERERH9P99ZpSVRivB/rgAAAABJRU5ErkJggg=="
        />

        <q-card-section>
          <q-btn
            fab
            color="primary"
            icon="place"
            class="absolute"
            style="top: 0; right: 3.5vh; transform: translateY(-50%)"
          />

          <div class="row no-wrap items-center justify-between">
            <div class="col text-h6 ellipsis">{{ placemarkStore.placemarkForm.name }}</div>
            <div class="col-auto text-grey text-caption q-pt-md">
              {{ Math.abs(placemarkStore.placemarkForm.longitude as number).toFixed(2) }}°{{
                (placemarkStore.placemarkForm.longitude as number) < 0 ? 'E' : 'W'
              }}
              {{ Math.abs(placemarkStore.placemarkForm.latitude as number).toFixed(2) }}°{{
                (placemarkStore.placemarkForm.latitude as number) < 0 ? 'S' : 'N'
              }}
            </div>
          </div>

          <!-- <q-rating v-model="stars" :max="5" size="32px" /> -->
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-caption text-grey">{{ placemarkStore.placemarkForm.description }}</div>
        </q-card-section>

        <q-expansion-item expand-separator v-model="placemarkStore.expanded" header-class="text-primary">
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" icon="edit" />
            </q-item-section>
            <q-item-section> Edit </q-item-section>
          </template>
          <q-card-section>
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
                <!-- <q-btn
                icon="delete_forever"
                round
                dense
                color="warning"
                @click.stop.prevent="clearImg"
                class="cursor-pointer"
              /> -->

                <q-icon name="delete_forever" color="warning" @click.stop.prevent="clearImg" class="cursor-pointer" />
              </template>
            </q-file>
            <q-img
              dense
              :src="placemarkStore.image_url"
              ref="qImgRef"
              spinner-color="red"
              placeholder-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWBAMAAADOL2zRAAAAG1BMVEXMzMyWlpaqqqq3t7fFxcW+vr6xsbGjo6OcnJyLKnDGAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABAElEQVRoge3SMW+DMBiE4YsxJqMJtHOTITPeOsLQnaodGImEUMZEkZhRUqn92f0MaTubtfeMh/QGHANEREREREREREREtIJJ0xbH299kp8l8FaGtLdTQ19HjofxZlJ0m1+eBKZcikd9PWtXC5DoDotRO04B9YOvFIXmXLy2jEbiqE6Df7DTleA5socLqvEFVxtJyrpZFWz/pHM2CVte0lS8g2eDe6prOyqPglhzROL+Xye4tmT4WvRcQ2/m81p+/rdguOi8Hc5L/8Qk4vhZzy08DduGt9eVQyP2qoTM1zi0/uf4hvBWf5c77e69Gf798y08L7j0RERERERERERH9P99ZpSVRivB/rgAAAABJRU5ErkJggg=="
              fit="contain"
            />
          </q-card-section>
        </q-expansion-item>
      </div>
    </q-scroll-area>
    <q-separator />
    <!-- <q-card-actions align="right">
      <q-btn  flat color="primary" round icon="done" />
      <q-btn  flat color="negative" round icon="delete" />
    </q-card-actions> -->

    <q-card-section class="row justify-end q-gutter-md no-wrap">
      <q-btn rounded dark-percentage unelevated color="primary" @click="savePlacemarkInfo" icon="done"> </q-btn>

      <q-btn rounded color="negative" @click="deleteHandler" icon="delete"> </q-btn>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { QTreeNode } from 'quasar';
import { usePlacemarkStore } from 'src/stores/PlacemarkStore';
import { imageToUrl } from 'src/tools/utils';
import { Placemark } from 'src/types/PlacemarkService/Placemark';
import { ref } from 'vue';
import { useVueCesium } from 'vue-cesium';

const viewer = useVueCesium().viewer;
const placemarkStore = usePlacemarkStore();

// const fileRef = ref<File | null>(null);
const qCardRef = ref();
const qImgRef = ref();
const fileSelectedHandler = (file: File) => {
  placemarkStore.image_url = imageToUrl(file);
};

const savePlacemarkInfo = async () => {
  const id = placemarkStore.placemarkForm.id as string;
  const placemark = viewer.entities.getById(id) as Placemark;

  const propsToUpdate = {
    name: placemarkStore.placemarkForm.name,
    description: placemarkStore.placemarkForm.description,
    file: placemarkStore.placemarkForm.file,
  };
  await placemark.update(propsToUpdate);
  ((placemarkStore.placemarkNodes[0].children as QTreeNode[]).find((node) => node.id === id) as QTreeNode).label =
    placemarkStore.placemarkForm.name;
  cancelHandler();

  // placemarkStore.treeNodes = { ...placemarkStore.treeNodes };
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
  placemarkStore.image_url = undefined;
};

const deleteHandler = async () => {
  const id = placemarkStore.placemarkForm.id as string;
  const placemark = viewer.entities.getById(id) as Placemark;
  await placemark.deleteInfo();
  viewer.entities.removeById(id);
  cancelHandler();
};
</script>

<style lang="scss" scoped>
.scroll-content {
  width: 35vh;
  height: 40vh;
  .content {
    width: 35vh;
    // height: 40vh;
  }
}
</style>
