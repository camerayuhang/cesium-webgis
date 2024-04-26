// 标量的基本信息（目前暂时只有温度数据，因此键值名为temp，后续可以修改为通用的value）
interface ScalarInterface {
  lon: number;
  lat: number;
  temp: number;
}
// 标量的数据结构
interface ScalarDataStruct {
  time: string;
  dimensions: { lat: number; lon: number; lev: number };
  bounds: number[][];
  data: ScalarInterface[];
}

export type { ScalarInterface, ScalarDataStruct };
