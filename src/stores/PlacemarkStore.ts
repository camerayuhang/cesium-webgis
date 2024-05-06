import { defineStore } from 'pinia';
import { QTreeNode } from 'quasar/dist/types/api/qtree';
import { PlacemarkInfoToSend } from 'src/types/PlacemarkService/PlacemarkInfo';
import { PlacemarkNode } from 'src/types/PlacemarkService/PlacemarkNode';
import { ref } from 'vue';

export const usePlacemarkStore = defineStore('PlacemarkStore', () => {
  const placemarkForm = ref<PlacemarkInfoToSend>({
    id: '',
    name: '',
    latitude: 0,
    longitude: 0,
    height: 0,
    description: '',
    file: undefined,
    cartesian_x: 0,
    cartesian_y: 0,
    cartesian_z: 0,
  });
  const image_url = ref<string | undefined>('');

  const visible = ref(false);
  const canvasPosition = { x: 0, y: 0 };
  const expanded = ref(false);
  const saved = ref(false);
  const placemarkNodes = ref<QTreeNode[]>([]);

  const simple = ref<QTreeNode[]>([]);

  // const updatePlacemarkArray = (id: string) => {
  //   const placemark = placemarkArray.value.find((placemark) => placemark.id === id) as PlacemarkInfo;

  //   placemark.name = placemarkForm.value.name;
  //   console.log(placemarkForm.value);

  //   placemark.description = placemarkForm.value.description;
  //   placemark.image_url = placemarkForm.value.image_url;
  // };

  const resetCurrentPlacemark = () => {
    placemarkForm.value = {
      id: '',
      name: '',
      latitude: 0,
      longitude: 0,
      height: 0,
      description: '',
      file: undefined,
      cartesian_x: 0,
      cartesian_y: 0,
      cartesian_z: 0,
    };
    image_url.value = '';
  };
  return {
    image_url,
    visible,
    canvasPosition,
    placemarkForm,
    saved,
    expanded,
    simple,
    placemarkNodes,
    resetCurrentPlacemark,
  };
});
