import { Injectable } from '@angular/core';
import { CanActivate, Router, CanLoad, Route, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { ToastService } from '../services/toast/toast.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService ) {}

  canActivate(): Observable<boolean>{
    return this.authService.isAuth()
        .pipe(
          tap( status => {
            if ( !status ) {
              this.toastService.info('Inicia sesión para continuar');
              this.router.navigate(['/auth/login']);
            }
          })
        );
  }

}
