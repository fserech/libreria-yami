import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { ToastService } from '../services/toast.service';

export interface FormComponent {
  isDirty: () => boolean;
  isSaving: boolean;
}


export const pendingChangesReportsGuard: CanDeactivateFn<FormComponent> = (
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
          .confirm('Confirmación', null, null, 'Los campos para generar el reporte estan incompletos ¿Descartar?')
          .then((result) => {
            return result.isConfirmed;
          });
  }

  return true;
};

