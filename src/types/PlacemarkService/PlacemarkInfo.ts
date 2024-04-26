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
  // canvasPositionX?: number;
  // canvasPositionY?: number;
}

interface PlacemarkImage {
  id: string;
  name: string;
  type: string;
  image: string;
}

interface PlacemarkInfoToSend extends Partial<PlacemarkInfo> {
  file?: File;
}

// type PlacemarkInfoToSend = Omit<PlacemarkInfo, 'canvasPositionX' | 'canvasPositionY' | 'id'>;

export type { PlacemarkInfo, PlacemarkInfoToSend };
