import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocaleFilesJsonService } from '../../services/locale-files-json/locale-files-json.service';
import { Role } from 'src/app/dashboard/users-roles/models/role';
import { ROLES_COLLECTION_NAME } from '../../constants/collections-name-firebase';
import { Module } from '../../models/module';
import { Submodule } from '../../models/submodule';
import { UserData } from '../../models/user';
import { DashboardService } from '../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-page-widgets',
  templateUrl: './page-widgets.component.html',
  styleUrls: ['./page-widgets.component.scss'],
})
export class PageWidgetsComponent  implements OnInit {
  submodules: Submodule[] = [];
  role: Role;
  module: Module;
  load: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localFileService: LocaleFilesJsonService,
    private dashboardService: DashboardService,) {}

  ngOnInit() {
    this.load = true;
    const user: UserData = JSON.parse(localStorage.getItem('user'));
    this.dashboardService.getDocumentByIdRealTime(ROLES_COLLECTION_NAME, user.roleRef)
    .subscribe({
      next: (role: any) => {
        this.role = role;
        this.getModuleRoute() === 'home' ? this.submodules = this.getWidgetsHome() : this.submodules = this.getSubmodules();
        this.load = false;
      },
      error: (error: any) => {
        console.log(error);
        this.load = false;
      }});
  }

  getModuleRoute(): string{
    return this.route.snapshot.params['module'];
  }

  getSubmodules(): Submodule[]{
    let submodulesAccess: Submodule[] = [];
    const permissions: Module[] = this.getPermissionsRole();
    permissions.forEach((module: Module) => {
      if(module.access && module.name === this.getModuleRoute()){
        this.module = module;
        module.submodules.forEach((submodule: Submodule) => {
          if(submodule.access){
            submodulesAccess.push(submodule)
          };
        });
      }
    });
    return submodulesAccess;
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

  navigateToSubmodule(path: string){
    console.log('dashboard' + path);
    this.router.navigate(['dashboard' + path]);
  }

  getWidgetsHome(): Submodule[]{
    let widgets: Submodule[] = [];
    const permissions: Module[] = this.getPermissionsRole();

    permissions.forEach((module: Module) => {
        this.module = module;
        module.submodules.forEach((submodule: Submodule) => {
          if(submodule.access && submodule.widget) widgets.push(submodule);
        });
    });

    return widgets;
  }
}
