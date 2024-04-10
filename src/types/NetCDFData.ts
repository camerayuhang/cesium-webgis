interface NetCDFData {
  dimensions: { lon: number; lat: number; lev: number };
  lon: { array: Float32Array; min: number; max: number; delta: number };
  lat: { array: Float32Array; min: number; max: number; delta: number };
  lev: { array: Float32Array; min: number; max: number };
  U: { array: Float32Array; min: number; max: number };
  V: { array: Float32Array; min: number; max: number };
}

export type { NetCDFData };
