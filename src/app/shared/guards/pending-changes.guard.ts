
import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { ToastService } from '../services/toast.service';

export interface FormComponent {
  isDirty: () => boolean;
  isSaving: boolean;
}

export const pendingChangesGuard: CanDeactivateFn<any> = (component: any) => {

  // Si Angular intenta ejecutar el guard ANTES de crear el componente
  if (!component) return true;

  // Si el componente no usa isSaving o isDirty, no debe bloquear navegación
  if (typeof component.isSaving === 'undefined') return true;
  if (typeof component.isDirty === 'undefined') return true;

  if (component.isSaving) return true;

  if (component.isDirty()) {
    const toast = inject(ToastService);
    return toast
      .confirm('Cambios sin guardar', null, null, '¿Descartar cambios?')
      .then(r => r.isConfirmed);
  }

  return true;
};
