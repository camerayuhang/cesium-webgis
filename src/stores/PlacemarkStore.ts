import { defineStore } from 'pinia';
import { PlacemarkInfo } from 'src/types/PlacemarkService/PlacemarkInfo';
import { ref } from 'vue';

export const usePlacemarkStore = defineStore('PlacemarkStore', () => {
  const placemarkArray = ref<PlacemarkInfo[]>([]);

  const placemarkForm = ref<PlacemarkInfo>({
    id: '',
    name: '',
    latitude: 0,
    longitude: 0,
    description: '',
    imageUrl: '',
    canvasPositionX: 0,
    canvasPositionY: 0,
  });

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

  const updatePlacemarkArray = (id: string) => {
    const placemark = placemarkArray.value.find((placemark) => placemark.id === id) as PlacemarkInfo;

    placemark.name = placemarkForm.value.name;
    console.log(placemarkForm.value);

    placemark.description = placemarkForm.value.description;
    placemark.imageUrl = placemarkForm.value.imageUrl;
  };

  const resetCurrentPlacemark = () => {
    placemarkForm.value = {
      id: '',
      name: '',
      latitude: 0,
      longitude: 0,
      description: '',
      imageUrl: '',
      canvasPositionX: 0,
      canvasPositionY: 0,
    };
  };
  return {
    placemarkArray,
    visible,
    placemarkForm,
    saved,
    setCurrentPlacemarkById,
    resetCurrentPlacemark,
    updatePlacemarkArray,
  };
});
