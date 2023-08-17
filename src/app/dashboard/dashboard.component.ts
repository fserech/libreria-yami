import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UsersService } from './users-roles/services/users.service';
import { DashboardService } from '../shared/services/dashboard/dashboard.service';
import { ROLES_COLLECTION_NAME, USERS_COLLECTION_NAME } from '../shared/constants/collections-name-firebase';
import { UserData, UserFirestore } from '../shared/models/user';
import { Role } from './users-roles/models/role';
import { Subscription } from 'rxjs';
import { MenuController } from '@ionic/angular';
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

  user: UserFirestore
  role: Role;
  load: boolean = false;
  permissions: Module[] = [];
  permissionsFooter: Module[] = [];
  subscriptions: Subscription[] = [];

  icon: string = '';
  showButtonBack: boolean = false;
  buttonBackText: boolean = false;
  title: string = 'titulo';

  subscriptionsRole: Subscription;


  constructor(
    private usersService: UsersService,
    private dashboardService: DashboardService,
    private menuCtrl: MenuController,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private location: Location) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.load = true;
    this.getRoleUser();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getRoleUser(){
    const user: UserData = JSON.parse(localStorage.getItem('user'));
    this.subscriptionsRole = this.dashboardService.getDocumentByIdRealTime(ROLES_COLLECTION_NAME, user.roleRef)
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
    const success = this.cleanLocalStorage();
    if(success){
      this.usersService.logout();
      this.location.ngOnDestroy();
    }
  }

  navigateRoute(path: string){
    this.router.navigate([path]);
    this.hideMenu();
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
    this.hideMenu();
    // this.router.navigate(['dashboard/'+ module.path], { queryParams: { module: JSON.stringify(module) }});
    this.router.navigate(['dashboard/'+ module.path]);
  }

  cleanLocalStorage(): boolean{
    localStorage.clear();
    const userData: UserData = JSON.parse(localStorage.getItem('user'));
    if(userData){ return false }
    return true;
  }
}
