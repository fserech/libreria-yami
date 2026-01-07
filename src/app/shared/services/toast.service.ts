import { Injectable } from '@angular/core';
import Swal from 'sweetalert2'
@Injectable({
  providedIn: 'root'
})
export class ToastService {


  constructor() {}

  success(title: string, message?: string, time?: number, position?: 'top' | 'top-start' | 'top-end' | 'top-left' | 'top-right' | 'center' |
  'center-start' | 'center-end' | 'center-left' | 'center-right'| 'bottom' | 'bottom-start' | 'bottom-end' | 'bottom-left' | 'bottom-right'){
    const Toast = Swal.mixin({
      toast: true,
      position: (position) ? position : 'top-end',
      showConfirmButton: false,
      timer: (time && time > 0) ? time : 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: 'success',
      title: title,
      text: (message && message !=='') ? message : ''
    });
  }

  error(title: string, message?: string, time?: number, position?: 'top' | 'top-start' | 'top-end' | 'top-left' | 'top-right' | 'center' |
  'center-start' | 'center-end' | 'center-left' | 'center-right'| 'bottom' | 'bottom-start' | 'bottom-end' | 'bottom-left' | 'bottom-right'){
    const Toast = Swal.mixin({
      toast: true,
      position: (position) ? position : 'top-end',
      showConfirmButton: false,
      timer: (time && time > 0) ? time : 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: 'error',
      title: title,
      text: (message && message !=='') ? message : ''
    });
  }

  warning(title: string, message?: string, time?: number, position?: 'top' | 'top-start' | 'top-end' | 'top-left' | 'top-right' | 'center' |
  'center-start' | 'center-end' | 'center-left' | 'center-right'| 'bottom' | 'bottom-start' | 'bottom-end' | 'bottom-left' | 'bottom-right'){
    const Toast = Swal.mixin({
      toast: true,
      position: (position) ? position : 'top-end',
      showConfirmButton: false,
      timer: (time && time > 0) ? time : 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: 'warning',
      title: title,
      text: (message && message !=='') ? message : ''
    });
  }

  info(title: string, message?: string, time?: number, position?: 'top' | 'top-start' | 'top-end' | 'top-left' | 'top-right' | 'center' |
  'center-start' | 'center-end' | 'center-left' | 'center-right'| 'bottom' | 'bottom-start' | 'bottom-end' | 'bottom-left' | 'bottom-right'){
    const Toast = Swal.mixin({
      toast: true,
      position: (position) ? position : 'top-end',
      showConfirmButton: false,
      timer: (time && time > 0) ? time : 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: 'info',
      title: title,
      text: (message && message !=='') ? message : ''
    });
  }

  question(title: string, message?: string, time?: number, position?: 'top' | 'top-start' | 'top-end' | 'top-left' | 'top-right' | 'center' |
  'center-start' | 'center-end' | 'center-left' | 'center-right'| 'bottom' | 'bottom-start' | 'bottom-end' | 'bottom-left' | 'bottom-right'){
    const Toast = Swal.mixin({
      toast: true,
      position: (position) ? position : 'top-end',
      showConfirmButton: false,
      timer: (time && time > 0) ? time : 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: 'question',
      title: title,
      text: (message && message !=='') ? message : ''
    });
  }

  confirm(title: string, textConfirm?: string, textCancel?: string,  message?: string, icon?: 'success'|'info'|'warning'|'error'|'question'){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "text-white rounded bg-blue-500 m-2 p-2 font-bold",
        cancelButton: "text-white rounded bg-red-500 m-2 p-2 font-bold"
      },
      buttonsStyling: false
    });

    return swalWithBootstrapButtons.fire({
      title: title,
      text: (message) ? message : '',
      icon: (icon) ? icon : 'error',
      showCancelButton: true,
      confirmButtonText: (textConfirm && textConfirm !== '') ? textConfirm : 'Confirmar',
      cancelButtonText: (textCancel && textCancel !== '') ? textCancel : 'Cancelar',
      reverseButtons: true
    })
  }

  user(title: string, textConfirm?: string,  message?: string, icon?: 'success'|'info'|'warning'|'error'|'question'){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "text-white rounded bg-blue-500 m-2 p-2 font-bold",
      },
      buttonsStyling: false
    });

    return swalWithBootstrapButtons.fire({
      title: title,
      text: (message) ? message : '',
      icon: (icon) ? icon : 'warning',
    
      confirmButtonText: textConfirm && textConfirm.trim() !== '' ? textConfirm.trim() : 'Aceptar'

    })
  }
  ReturnValidotor(title: string, message?: string, textConfirm?: string, textCancel?: string): Promise<boolean> {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "text-white rounded bg-blue-500 m-2 p-2 font-bold",
        cancelButton: "text-white rounded bg-red-500 m-2 p-2 font-bold"
      },
      buttonsStyling: false
    });

    return swalWithBootstrapButtons.fire({
      title: title,
      text: message || '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: textConfirm || 'Aceptar',
      cancelButtonText: textCancel || 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      return result.isConfirmed;
    });
  }
}
