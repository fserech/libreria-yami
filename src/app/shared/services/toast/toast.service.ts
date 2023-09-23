import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private toastController: ToastController) {}

  async success(message:string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      icon: 'checkmark-circle-outline',
      mode:'ios',
      buttons: [
        {
          text: 'Aceptar',
          role: 'cancel'
        }
      ]

    });

    await toast.present();
  }

  async error(message:string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1000,
      position: 'bottom',
      icon: 'close-circle-outline'
    });

    await toast.present();
  }

  async info(message:string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'bottom',
      icon: 'information-circle-outline'
    });

    await toast.present();
  }

  async warning(message:string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'bottom',
      icon: 'warning-outline'
    });

    await toast.present();
  }
  // async presentToast(position: 'top' | 'middle' | 'bottom') {
  //   const toast = await this.toastController.create({
  //     message: 'Hello World!',
  //     duration: 1500,
  //     position: position
  //   });

  //   await toast.present();
  // }

}
