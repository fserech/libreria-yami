import { AuthService } from './../services/auth.service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const authService = inject(AuthService)

  if(authService.getTokenStorage()){
    if(state.url && state?.url === '/authentication/login'){
      return router.createUrlTree(['/']);
    }
    return true;
  }
  return router.createUrlTree(['/authentication']);
};
