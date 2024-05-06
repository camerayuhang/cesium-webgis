import { placemarkAPI } from 'src/boot/axios';
import { PlacemarkInfo } from 'src/types/PlacemarkService/PlacemarkInfo';
import { Dialog, Notify, Loading } from 'quasar';
import { HttpStatus } from 'src/types/HttpStatus';

const getAllPlacemarks = async (): Promise<PlacemarkInfo[]> => {
  Loading.show({
    message: 'Loading all placemarks...',
  });
  let { data } = await placemarkAPI.get('/placemarkinfo');
  if (!data) {
    data = new Array<PlacemarkInfo>(0);
  }
  Loading.hide();
  Notify.create({
    message: 'Loading all placemarks successfully!',
    type: 'positive',
  });
  return data;
};

const getPlacemarkById = async (id: number): Promise<PlacemarkInfo> => {
  const { data } = await placemarkAPI.get(`/placemarkinfo/${id}`);
  return data;
};

const createPlaceMarkInfo = async (form: Partial<PlacemarkInfo>): Promise<PlacemarkInfo> => {
  const { data } = await placemarkAPI.post('/placemarkinfo', objectToFormData(form));

  return data;
};

const updatePlacemarkInfoById = async (id: string, form: Partial<PlacemarkInfo>): Promise<PlacemarkInfo> => {
  const response = await placemarkAPI.put(`/placemarkinfo/${id}`, objectToFormData(form));
  let message = '';
  let type = '';
  if (response.status === HttpStatus.OK) {
    message = 'Update successfully';
    type = 'positive';
  } else if (response.status === HttpStatus.NOT_FOUND) {
    message = 'Placemark not found';
    type = 'negative';
  }
  Notify.create({
    message,
    type,
  });
  return response.data;
};

const deletePlacemarkById = (id: string) => {
  return new Promise((resolve, reject) => {
    Dialog.create({ class: 'z-max', title: 'Confirm', message: 'Are you sure to delete this placemark?' }).onOk(
      async () => {
        try {
          const response = await placemarkAPI.delete(`/placemarkinfo/${id}`);
          if (response.status === HttpStatus.OK) {
            resolve(
              Notify.create({
                message: response.data,
                type: 'info',
              })
            );
          } else if (response.status === HttpStatus.INTERNAL_SERVER_ERROR) {
            resolve(
              Notify.create({
                message: 'server error',
                type: 'negative',
              })
            );
          }
        } catch (error) {
          reject(
            Notify.create({
              message: error as string,
              type: 'negative',
            })
          );
        }
      }
    );
  });
};

const deletePlacemarkImageById = (placemarkId: string) => {
  return new Promise((resolve, reject) => {
    Dialog.create({ class: 'z-max', title: 'Confirm', message: 'Are you sure to delete this image?' }).onOk(
      async () => {
        try {
          const response = await placemarkAPI.delete(`/placemarkimage/${placemarkId}`);
          if (response.status === HttpStatus.OK) {
            resolve(
              Notify.create({
                message: response.data,
                type: 'info',
              })
            );
          } else if (response.status === HttpStatus.NOT_FOUND) {
            resolve(
              Notify.create({
                message: 'server error',
                type: 'negative',
              })
            );
          } else if (response.status === HttpStatus.INTERNAL_SERVER_ERROR) {
            resolve(
              Notify.create({
                message: 'server error',
                type: 'negative',
              })
            );
          }
        } catch (error) {
          reject(error);
        }
      }
    );
  });
  // Dialog.create({ class: 'z-max', title: 'Confirm', message: 'Are you sure you want to delete this image?' }).onOk(
  //   async () => {
  //     const response = await placemarkAPI.delete(`/placemarkimage/${placemarkId}`);
  //     if (response.status === HttpStatus.OK) {
  //       Notify.create({
  //         message: response.data,
  //         type: 'info',
  //       });
  //     } else if (response.status === HttpStatus.NOT_FOUND) {
  //       Notify.create({
  //         message: response.data,
  //         type: 'negative',
  //       });
  //     } else if (response.status === HttpStatus.INTERNAL_SERVER_ERROR) {
  //       Notify.create({
  //         message: 'server error',
  //         type: 'negative',
  //       });
  //     }
  //   }
  // );
};

function objectToFormData(obj: any): FormData {
  const formData = new FormData();

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value as any);
    }
  });

  return formData;
}

export {
  getAllPlacemarks,
  getPlacemarkById,
  createPlaceMarkInfo,
  updatePlacemarkInfoById,
  deletePlacemarkImageById,
  deletePlacemarkById,
};
