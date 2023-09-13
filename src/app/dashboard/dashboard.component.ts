import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UsersService } from './users-roles/services/users.service';
import { DashboardService } from '../shared/services/dashboard/dashboard.service';
import { ROLES_COLLECTION_NAME } from '../shared/constants/collections-name-firebase';
import { UserData, UserFirestore } from '../shared/models/user';
import { Role } from './users-roles/models/role';
import { Subscription } from 'rxjs';
import { MenuController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Module } from '../shared/models/module';
import { Submodule } from '../shared/models/submodule';
import { Location } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent  implements OnInit, OnDestroy, AfterViewInit {

  user: UserData
  role: Role;
  load: boolean = false;
  themeToggle = false;
  showButtonBack: boolean = false;
  buttonBackText: boolean = false;

  title: string = 'titulo';
  icon: string = '';

  permissions: Module[] = [];
  permissionsFooter: Module[] = [];

  subscriptions: Subscription[] = [];
  subscriptionsRole: Subscription;


  constructor(
    private usersService: UsersService,
    private dashboardService: DashboardService,
    private menuCtrl: MenuController,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private platform: Platform) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.load = true;
    this.getRoleUser();

    const darkModeEnabled = JSON.parse(localStorage.getItem('darkMode'));
    const mode: string = darkModeEnabled ? '(prefers-color-scheme: dark)' : '(prefers-color-scheme: light)';

    const prefersDark = window.matchMedia(mode);
    this.initializeDarkTheme(prefersDark.matches);
    prefersDark.addEventListener('change', (mediaQuery) => this.initializeDarkTheme(mediaQuery.matches));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getRoleUser(){
    this.user = JSON.parse(localStorage.getItem('user'));
    this.subscriptionsRole = this.dashboardService.getDocumentByIdRealTime(ROLES_COLLECTION_NAME, this.user.roleRef)
    .subscribe({
      next: (role: any) => {
        this.role = role;
        this.permissions = this.getPermissionsRole();

        this.permissionsFooter = this.getPermissionsMenuFooter();
        this.load = false;
      },
      error: (error: any) => {
        console.log(error);
        this.load = false;
      }});

      this.subscriptions.push(this.subscriptionsRole);
  }

  showMenu() {
    this.menuCtrl.open();
  }

  hideMenu() {
    this.menuCtrl.close();
  }

  logout(){
    const darkMode = localStorage.getItem('darkMode');
    console.log(darkMode)
    const success = this.cleanLocalStorage();
    if(darkMode === 'true')localStorage.setItem('darkMode', 'true')
    if(success){
      this.usersService.logout();
      this.location.ngOnDestroy();
    }
  }

  getPermissionsRole(): Module[]{
    let permissions: Module[] = [];

    this.role.permissions.forEach((module: Module) => {
      let permissionsSubmodule: Submodule[] = [];
      const submodules: Submodule[] = module.submodules;

      if(module.access){
        submodules.forEach((submodule: Submodule) => {
          if(submodule.access) permissionsSubmodule.push(submodule);
        });
        module.submodules = permissionsSubmodule;
        permissions.push(module);
      }
    });

    permissions.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    return permissions;
  }

  getPermissionsMenuFooter(): Module[]{
    let permissions: Module[] = [];

    this.role.permissions.forEach((module: Module) => {
      if(module.access && module.menuFooter)permissions.push(module);
    });
    return permissions;
  }

  navigateModule(module: Module){
    console.log('ruta: dashboard/' + module.path);
    this.hideMenu();
    this.router.navigate(['dashboard/' + module.path]);
  }

  cleanLocalStorage(): boolean{
    localStorage.clear();
    const userData: UserData = JSON.parse(localStorage.getItem('user'));
    if(userData){ return false }
    return true;
  }


  initializeDarkTheme(isDark) {
    this.themeToggle = isDark;
    this.toggleDarkTheme(isDark);
  }

  toggleChange(ev) {
    this.toggleDarkTheme(ev.detail.checked);
    localStorage.setItem('darkMode', JSON.stringify(ev.detail.checked));
  }

  toggleDarkTheme(shouldAdd) {
    // console.log(shouldAdd);
    document.body.classList.toggle('dark', shouldAdd);
  }

  // toggleDarkMode(darkmode: boolean) {
  //   this.darkMode = darkmode;
  //   this.applyDarkMode();
  //   this.cdr.detectChanges(); // Forzar detección de cambios
  // }

  // private applyDarkMode() {
  //   if (this.darkMode) {
  //     document.body.classList.add('dark-theme');
  //   } else {
  //     document.body.classList.remove('dark-theme');
  //   }
  // }
}
