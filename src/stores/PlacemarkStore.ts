import { defineStore } from 'pinia';
import { PlacemarkInfo, PlacemarkInfoToSend } from 'src/types/PlacemarkService/PlacemarkInfo';
import { ref } from 'vue';

export const usePlacemarkStore = defineStore('PlacemarkStore', () => {
  const placemarkArray = ref<PlacemarkInfo[]>([]);

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
    canvasPositionX: 0,
    canvasPositionY: 0,
  });
  const image_url = ref<string | undefined>('');

  const visible = ref(false);
  const saved = ref(false);

  const setCurrentPlacemarkById = (id: string) => {
    const placemark = placemarkArray.value.find((placemark) => placemark.id === id);
    if (placemark) {
      placemarkForm.value = { ...placemark };
    } else {
      resetCurrentPlacemark();
    }
  };

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
      canvasPositionX: 0,
      canvasPositionY: 0,
    };
    image_url.value = '';
  };
  return {
    placemarkArray,
    image_url,
    visible,
    placemarkForm,
    saved,
    setCurrentPlacemarkById,
    resetCurrentPlacemark,
    // updatePlacemarkArray,
  };
});
