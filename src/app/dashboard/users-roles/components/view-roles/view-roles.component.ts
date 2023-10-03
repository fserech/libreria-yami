import { Component, OnInit } from '@angular/core';

import { Role } from '../../models/role';
import { ROLES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import {  NavController } from '@ionic/angular';

@Component({
  selector: 'app-view-roles',
  templateUrl: './view-roles.component.html',
  styleUrls: ['./view-roles.component.scss'],
})
export class ViewRolesComponent  implements OnInit {

  title: string = 'Lista de Roles';
  roles: Role[] = []; 
  

  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController,
 
    ) {} // Inyecta Router si es necesario

  ngOnInit() {
    this.dashboardService
      .getAllItemsCollection(ROLES_COLLECTION_NAME, 'name') 
      .subscribe({
        next: (roles: Role[]) => {
          this.roles = roles;
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  editRole(role: any) {
    const uid = role.uid;
    this.navCtrl.navigateForward([`/dashboard/users-roles/edit/${role.uid}`]); // Ajusta la ruta según tu configuración
  }

  deleteRole(role: any) {
    // Implementa la lógica para eliminar un rol
  }
  handleInput(event: any) {
    const value = event.target.value.toLowerCase();
    this.dashboardService.searchForField(ROLES_COLLECTION_NAME, 'name', value)
    .subscribe(
      (response: any[]) => {
        this.roles = response;
      },
      (error: any) => {
        console.log(error);
      }
      // {
      //     next: (response: Brand[]) => {
      //       this.brands = response;
      //     },
      //     error: (error: any) => {
      //       console.log(error);
      //     }
      //   }
        );
  }

  firstCapitalLetter(cadena: string): string {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
  }

}
