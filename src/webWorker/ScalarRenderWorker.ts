import kriging from 'js-kriging';
import { ScalarInterface } from 'src/types/visualizationClasses/Scalar';
self.addEventListener('message', (event) => {
  const myBound = event.data.myBound;
  const dataList = event.data.dataList;
  const grid = trainKrigin(myBound, dataList);
  // 传递结果
  postMessage(grid);
});

function trainKrigin(bounds: number[][][], dataList: ScalarInterface[]) {
  // 构建三个空数组
  const t = [];
  const x = [];
  const y = [];
  // 遍历每一个data
  for (const data of dataList) {
    t.push(data.temp);
    x.push(data.lon);
    y.push(data.lat);
  }
  // 进行训练
  const variogram = kriging.train(t, x, y, 'exponential', 0, 100);
  //构建格网
  const grid = kriging.grid(bounds, variogram, 0.001);
  return grid;
}
