import { Component, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { USERS_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase'; // Asegúrate de importar la colección correcta
import { UserData } from 'src/app/shared/models/user';

import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';

@Component({
  selector: 'app-view-users', // Asegúrate de que el selector sea único y no entre en conflicto con otros componentes
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.scss'],
})
export class ViewUsersComponent  implements OnInit {
  users: UserData[] = [];
  title: string = 'Ver Usuarios';

  

  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController,
   
  ) {}

  ngOnInit() {
    this.dashboardService
      .getAllItemsCollection(USERS_COLLECTION_NAME, 'userName') 
      .subscribe({
        next: (users: UserData[]) => {
          this.users = users;
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  editUser(user: UserData) {
    const uid = user.uid;
    this.navCtrl.navigateForward([`/dashboard/users-roles/edit/${user.uid}`]); // Asegúrate de que la ruta sea correcta para editar usuarios
  }

  deleteUser(user: UserData) {
    // Agrega aquí la lógica para eliminar usuarios si es necesario
  }

  handleInput(event: any) {
    const query = event.target.value.toLowerCase();

    this.dashboardService.searchByArrayString(USERS_COLLECTION_NAME, 'userName', query, 'email') 
      .subscribe(
        (response: any[]) => {
          this.users = response;
        },
        (error: any) => {
          console.log(error);
        }
      );
  }

  firstCapitalLetter(cadena: string): string {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
  }
}
