interface PlacemarkInfo {
  id: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  imageUrl?: string;
  canvasPositionX?: number;
  canvasPositionY?: number;
}

export type { PlacemarkInfo };
