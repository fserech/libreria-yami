import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { ToastService } from '../services/toast.service';

export interface FormComponent {
  isDirty: () => boolean;
  isSaving: boolean;
  isLoadingData?: boolean; // ✅ NUEVO: Flag opcional para carga de datos
}

export const pendingChangesGuard: CanDeactivateFn<any> = (component: any) => {
  // Si Angular intenta ejecutar el guard ANTES de crear el componente
  if (!component) {
    console.log('🔓 Guard: Component no existe - permitiendo navegación');
    return true;
  }

  // Si el componente no usa isSaving o isDirty, no debe bloquear navegación
  if (typeof component.isSaving === 'undefined') {
    console.log('🔓 Guard: No tiene isSaving - permitiendo navegación');
    return true;
  }

  if (typeof component.isDirty === 'undefined') {
    console.log('🔓 Guard: No tiene isDirty - permitiendo navegación');
    return true;
  }

  // ✅ CRÍTICO: Si está cargando datos iniciales, permitir navegación SIN preguntar
  if (component.isLoadingData === true) {
    console.log('🔓 Guard: isLoadingData=true - permitiendo navegación');
    return true;
  }

  // ✅ CRÍTICO: Si está en modo edición, permitir navegación inicial
  if (component.isEditMode === true && component.isLoadingData !== false) {
    console.log('🔓 Guard: Modo edición + cargando - permitiendo navegación');
    return true;
  }

  // Si está guardando, permitir navegación
  if (component.isSaving) {
    console.log('🔓 Guard: Guardando - permitiendo navegación');
    return true;
  }

  // Si hay cambios sin guardar, mostrar confirmación
  if (component.isDirty()) {
    console.log('⚠️ Guard: Hay cambios sin guardar - mostrando diálogo');
    const toast = inject(ToastService);
    return toast
      .confirm('Cambios sin guardar', null, null, '¿Descartar cambios?')
      .then(r => r.isConfirmed);
  }

  console.log('🔓 Guard: No hay cambios - permitiendo navegación');
  return true;
};
