import { PlacemarkPointInfo } from './PlacemarkPointInfo';

interface PlacemarkInfo {
  id: string;
  name?: string;
  latitude: number;
  longitude: number;
  height: number;
  description?: string;
  cartesian_x: number;
  cartesian_y: number;
  cartesian_z: number;
  placemark_image?: PlacemarkImage;
  placemark_point: PlacemarkPointInfo;
}

interface PlacemarkImage {
  id: string;
  name: string;
  type: string;
  image: string;
}

interface PlacemarkInfoToSend extends Partial<PlacemarkInfo> {
  file?: File;
  placemark_point: PlacemarkPointInfo;
}

// type PlacemarkInfoToSend = Omit<PlacemarkInfo, 'canvasPositionX' | 'canvasPositionY' | 'id'>;

export type { PlacemarkInfo, PlacemarkInfoToSend };
