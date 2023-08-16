import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsersService } from './users-roles/services/users.service';
import { DashboardService } from '../shared/services/dashboard/dashboard.service';
import { USERS_COLLECTION_NAME } from '../shared/constants/collections-name-firebase';
import { UserFirestore } from '../shared/models/user';
import { Role } from './users-roles/models/role';
import { Subscription } from 'rxjs';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Module } from '../shared/models/module';
import { Submodule } from '../shared/models/submodule';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent  implements OnInit, OnDestroy {

  user: UserFirestore
  role: Role;
  load: boolean = false;
  menuSidebar: any[] = [];
  menuFooter: any[] = [];
  subscriptions: Subscription[] = []

  constructor(
    private usersService: UsersService,
    private dashboardService: DashboardService,
    private menuCtrl: MenuController,
    private router: Router) { }

  ngOnInit() {
    this.usersService.getUserLocal().subscribe({
      next: (user: any) => {
        console.log(user);
        if (user) {
          this.getInformationUserFirestore(user.uid);
        } else {
          console.log('Usuario no autenticado');
        }
      },
      error: error => {console.log(error)},
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getInformationUserFirestore(uid: string){
    this.dashboardService.getDocumentById(USERS_COLLECTION_NAME, uid).subscribe({
      next: (user: UserFirestore) => {
        console.log('user: ', user);
        const roleRef = user.roleRef;
        this.dashboardService.getDataDocumentReference(roleRef).then((role: Role) => {
          this.role = role;
          console.log('role: ', this.role)
        });

      },
      error: error => {console.log(error)}
    });
  }

  showMenu() {
    this.menuCtrl.open();
  }

  hideMenu() {
    this.menuCtrl.close();
  }

  logout(){
    // const success = this.cleanLocalStorage();
    // if(success){
    //   this.authService.logout();
    //   this.location.ngOnDestroy();
    // }
  }

  navigateRoute(path: string){
    this.router.navigate([path]);
    this.hideMenu();
  }

  navigateModule(item: any){
    this.menuSidebar.forEach(module => {
      const nameModule = item.name
      if(module.name === nameModule && module.access){
        const encodedParam = JSON.stringify(module.submodules)
        this.router.navigate([module.path], { queryParams: { param: encodedParam } });
      }
    });

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
}
