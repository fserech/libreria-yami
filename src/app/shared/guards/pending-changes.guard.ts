
import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { ToastService } from '../services/toast.service';

export interface FormComponent {
  isDirty: () => boolean;
  isSaving: boolean;
}

export const pendingChangesGuard: CanDeactivateFn<FormComponent> = (
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
          .confirm('Cambios sin guardar', null, null, '¿Descartar cambios?')
          .then((result) => {
            return result.isConfirmed;
          });
  }

  return true;
};
