import { Injectable, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MenuItem, SubMenuItem } from '../interfaces/menu.model';
import { Menu } from '../constants/menu';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { UserProfile } from '../interfaces/user-profile';
import { URL_PERMISSIONS } from '../constants/endpoints';

@Injectable({
  providedIn: 'root',
})
export class MenuService implements OnDestroy {
  private _showSidebar = signal(true);
  private _showMobileMenu = signal(false);
  private _pagesMenu = signal<MenuItem[]>([]);
  private _subscription = new Subscription();
  private user: UserProfile = null;

  constructor(private router: Router, private http: HttpClient, private auth: AuthService) {
    this.setPermissions();
  }

  setPermissions(){

        this._pagesMenu.set([]);
        let permissionSub = this.getPermissions().subscribe({
          next: (response: any) => {
            this.user = this.auth.decodeToken();
            this._pagesMenu.set(response.pages);

            let sub = this.router.events.subscribe((event) => {
              if (event instanceof NavigationEnd) {
                this.expandMenuOnNavigation();
              }
            });
            this._subscription.add(sub);

          },
          error: (error: any) => {
            console.log(error)
          }
        });
        this._subscription.add(permissionSub);
  }

  private expandMenuOnNavigation() {
    this._pagesMenu().forEach((menu) => {
      let activeGroup = false;
      menu.items.forEach((subMenu) => {
        const active = this.isActive(subMenu.route);
        subMenu.expanded = active;
        subMenu.active = active;
        if (active) activeGroup = true;
        if (subMenu.children) {
          this.expand(subMenu.children);
        }
      });
      menu.active = activeGroup;
    });
  }

  getPermissions(): Observable<any> {
    this.user = this.auth.decodeToken();
    const role: string = this.user.role === 'ROLE_ADMIN' ? 'admin' : 'user';
    return this.http.get<any>(`${URL_PERMISSIONS}${role}`);
  }

  get showSideBar() {
    return this._showSidebar();
  }
  get showMobileMenu() {
    return this._showMobileMenu();
  }
  get pagesMenu() {
    return this._pagesMenu();
  }

  set showSideBar(value: boolean) {
    this._showSidebar.set(value);
  }
  set showMobileMenu(value: boolean) {
    this._showMobileMenu.set(value);
  }

  public toggleSidebar() {
    this._showSidebar.set(!this._showSidebar());
  }

  public toggleMenu(menu: any) {
    this.showSideBar = true;
    menu.expanded = !menu.expanded;
  }

  public toggleSubMenu(submenu: SubMenuItem) {
    submenu.expanded = !submenu.expanded;
  }

  private expand(items: Array<any>) {
    items.forEach((item) => {
      item.expanded = this.isActive(item.route);
      if (item.children) this.expand(item.children);
    });
  }

  private isActive(instruction: any): boolean {
    return this.router.isActive(this.router.createUrlTree([instruction]), {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
