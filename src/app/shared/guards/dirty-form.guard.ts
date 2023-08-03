import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DirtyGuard } from '../models/dirty-guard';


@Injectable({
  providedIn: 'root'
})
export class DirtyFormGuard implements CanDeactivate<unknown> {

  canDeactivate(
    component: DirtyGuard,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return component.isDirty ? component.isDirty() : true;
  }

}
export { DirtyGuard };
