import { AuthService } from './../services/auth.service';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export const requestInterceptor: HttpInterceptorFn = (req, next) => {

  const token: string = localStorage.getItem('token');

  if(req.url !== `${environment.apiUrl}/auth/login`){
    const request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(request)
  }

  return next(req);

};
