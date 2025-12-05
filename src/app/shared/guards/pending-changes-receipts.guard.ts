import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { ToastService } from '../services/toast.service';

export interface FormComponent {
  isDirty: () => boolean;
  isSaving: boolean;
}

export const pendingChangesReceiptsGuard: CanDeactivateFn<FormComponent> = (
  component: FormComponent,
  currentRoute,
  currentState,
  nextState): Observable<boolean> | Promise<boolean> | boolean => {
    const toastService = inject(ToastService);

    if (component.isSaving) {
      return true;
    }

    if (component.isDirty()) {
    return toastService
          .confirm('Confirmación', null, null, 'Los campos para generar recibos estan incompletos ¿Descartar?')
          .then((result) => {
            return result.isConfirmed;
          });
  }

  return true;
};
