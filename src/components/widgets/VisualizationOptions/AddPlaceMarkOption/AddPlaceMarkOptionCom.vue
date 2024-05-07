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
    <q-tree :nodes="placemarkStore.placemarkNodes" node-key="id" default-expand-all dense>
      <template v-slot:header-root="prop">
        <div class="row items-center">
          <q-icon :name="prop.node.icon" color="orange" class="rotate-45 q-mr-xs" />
          <div class="text-weight-bold text-primary">{{ prop.node.label }}</div>
        </div>
      </template>
      <template v-slot:header-placemark="prop">
        <div class="row items-center text-brown no-wrap">
          <q-checkbox
            v-model="prop.node.entityVisibility"
            @update:model-value="
              (value, event) => {
                entityVisibilityHander(value, prop.node.id);
              }
            "
            dense
          ></q-checkbox>
          <q-icon :name="prop.node.icon" color="orange" class="rotate-45 q-mr-xs" />
          <div class="ellipsis">{{ prop.node.label }}</div>
        </div>
      </template>

      <template v-slot:body-content="prop">
        <div class="col">
          <div class="row q-gutter-xs q-mb-xs">
            <q-btn
              size="xs"
              dense
              round
              color="secondary"
              icon="navigation"
              @click="navigateHandler(prop.node.parentId)"
            />
            <q-btn
              size="xs"
              dense
              round
              color="deep-orange"
              icon="edit_location"
              @click="showHandler(prop.node.parentId)"
            />
            <q-btn size="xs" dense round color="red" icon="delete" @click="deleteHandelr(prop.node.parentId)" />
          </div>
          <div class="row items-center text-blue-grey">
            <q-checkbox
              dense
              color="teal"
              v-model="prop.node.labelVisibility"
              @update:model-value="
                (value, event) => {
                  labelVisibilityHander(value, prop.node.parentId);
                }
              "
              label="Label"
            />
          </div>
          <div class="row items-center text-blue-grey">
            <q-checkbox
              dense
              color="cyan"
              v-model="prop.node.billboardVisibility"
              label="Billboard"
              @update:model-value="
                (value, event) => {
                  billboardVisibilityHander(value, prop.node.parentId);
                }
              "
            />
          </div>
        </div>
      </template>
    </q-tree>
    <!-- <q-tree no-transition :nodes="placemarkStore.treeNodes" node-key="id" label-key="label" dense>
      <template v-slot:default-header="prop">
        <div class="row items-center">
          <q-checkbox
            v-model="prop.node.entityVisibility"
            @update:model-value="
              (value, event) => {
                visibilityHander(value, prop.node.id);
              }
            "
            dense
            v-if="!prop.node.header"
          ></q-checkbox>
          <q-icon :name="prop.node.icon || 'push_pin'" color="orange" class="rotate-45 q-mr-xs" />
          <div class="text-weight-bold text-primary">{{ prop.node.label }}</div>
        </div>
      </template>

      <template v-slot:default-body="prop">
        <div v-if="!prop.node.header" class="column rounded-borders">
          <div class="row q-ma-xs q-gutter-xs">
            <q-btn size="sm" dense round color="secondary" icon="navigation" />
            <q-btn size="sm" dense round color="deep-orange" icon="edit_location" />
            <q-btn size="sm" dense round color="red" icon="delete" @click="deleteHandelr(prop.node.id)" />
          </div>
          <div class="column">
            <q-checkbox
              dense
              color="teal"
              v-model="prop.node.labelVisibility"
              @update:model-value="
                (value, event) => {
                  visibilityHander(value, prop.node.id);
                }
              "
              label="Label"
            />
            <q-checkbox
              dense
              color="cyan"
              v-model="prop.node.billboardVisibility"
              @update:model-value="
                (value, event) => {
                  visibilityHander(value, prop.node.id);
                }
              "
              label="Billboard"
            />
          </div>
        </div>
      </template>
    </q-tree> -->

    <!-- <q-tree :nodes="placemarkStore.placemarkNodes" node-key="label" /> -->
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
import { watch, ref, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { PlacemarkService } from 'src/types/PlacemarkService/PlacemarkService';
import { createImgSrc } from 'src/tools/utils';
import { Placemark } from 'src/types/PlacemarkService/Placemark';
const loading = ref(false);
const enableAddPlacemark = ref(false);
const placemarkStore = usePlacemarkStore();
const vcViewer = useVueCesium();
const viewer = vcViewer.viewer;
const placemarkService = new PlacemarkService(viewer, placemarkStore.placemarkNodes);

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
  if (e.canvasPosition) {
    placemarkStore.canvasPosition.x = e.canvasPosition.x;
    placemarkStore.canvasPosition.y = e.canvasPosition.y;
  }
  placemarkStore.visible = e.visible;
});

const initPlacemark = async (value: boolean) => {
  if (value) {
    loading.value = true;
    await placemarkService.createAllPlacemarks();
    placemarkService.setPlacemarkSelectedAction();
    placemarkService.setCursorPointerAction();
    placemarkService.setEntityCollectionChangedAction();

    loading.value = false;
  } else {
    await placemarkService.removeAllPlacemarks();
    if (placemarkService.removeCallback) {
      placemarkService.removeCallback();
    }
  }
};

const addPlaceMark = () => {
  placemarkService.hideNewPlacemarkPanel();
  placemarkService.removeScreenSpaceEvent();

  placemarkService.setPlacemarkMovingAction();
  placemarkService.setPlacemarkAddedAction();
};

const entityVisibilityHander = (value: boolean, id: string) => {
  const placemark = viewer.entities.getById(id) as Placemark;
  placemark.show = value;
};

const labelVisibilityHander = (value: boolean, id: string) => {
  const placemark = viewer.entities.getById(id) as Placemark;
  (placemark.label as Cesium.LabelGraphics).show = new Cesium.ConstantProperty(value);
};

const billboardVisibilityHander = (value: boolean, id: string) => {
  const placemark = viewer.entities.getById(id) as Placemark;
  (placemark.billboard as Cesium.BillboardGraphics).show = new Cesium.ConstantProperty(value);
};

const { visible } = storeToRefs(placemarkStore);

const cancelHandler = () => {
  placemarkStore.visible = false;
  placemarkStore.placemarkForm.file = undefined;
  placemarkStore.image_url = undefined;
};

const deleteHandelr = async (id: string) => {
  const placemark = viewer.entities.getById(id) as Placemark;
  await placemark.deleteInfo();
  viewer.entities.removeById(id);
  cancelHandler();
};

const navigateHandler = (id: string) => {
  const placemark = viewer.entities.getById(id) as Placemark;
  viewer.flyTo(placemark);
};

const showHandler = (id: string) => {
  const placemark = viewer.entities.getById(id) as Placemark;
  placemarkService.hideNewPlacemarkPanel();
  placemarkService.selectedPlacemark = placemark;

  placemarkService.showNewPlacemarkPanel(placemarkService.selectedPlacemark);
};

watch(visible, () => {
  if (!visible.value) {
    placemarkStore.editExpanded = false;
    placemarkStore.styleExpanded = false;
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
