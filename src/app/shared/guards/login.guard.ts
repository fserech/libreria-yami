import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ToastService } from '../services/toast/toast.service';
import { AuthService } from '../services/auth/auth.service';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService) {}


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isAuth().pipe(
      tap((status) => {
        if (status) {
          // console.log(status);
          // this.toastService.info('Ya estas autenticado');
          this.router.navigate(['/dashboard']);
        }
      }),
      map((status) => !status)
    );
  }
}
