import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

interface Placemark {
  id: string;
  name?: string;
  latitude: string;
  longitude: string;
  description?: string;
  url?: string;
}

export const usePlacemarkStore = defineStore('PlacemarkStore', () => {
  const placemarkArray = ref<Placemark[]>([]);

  const currentPlacemark = ref<Placemark>({
    id: '',
    name: '',
    latitude: '',
    longitude: '',
    description: '',
    url: '',
  });
  const visible = ref(false);
  const position = reactive({
    left: 500,
    top: 500,
  });
  const saved = ref(false);

  const setCurrentPlacemarkById = (id: string) => {
    const placemark = placemarkArray.value.find((placemark) => placemark.id === id);
    if (placemark) {
      currentPlacemark.value.id = placemark.id;
      currentPlacemark.value.name = placemark.name;
      currentPlacemark.value.latitude = placemark.latitude;
      currentPlacemark.value.longitude = placemark.longitude;
      currentPlacemark.value.description = placemark.description;
      currentPlacemark.value.url = placemark.url;
    } else {
      $reset();
    }
  };

  const updatePlacemarkArray = (id: string) => {
    const placemark = placemarkArray.value.find((placemark) => placemark.id === id) as Placemark;
    placemark.name = currentPlacemark.value.name;
    placemark.description = currentPlacemark.value.description;
    placemark.url = currentPlacemark.value.url;
  };

  const $reset = () => {
    currentPlacemark.value = {
      id: '',
      name: '',
      latitude: '',
      longitude: '',
      description: '',
      url: '',
    };
  };
  return {
    placemarkArray,
    visible,
    position,
    currentPlacemark,
    saved,
    setCurrentPlacemarkById,
    $reset,
    updatePlacemarkArray,
  };
});
