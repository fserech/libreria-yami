import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { NavController } from '@ionic/angular';
import { Category } from 'src/app/shared/models/category';
import { CATEGORIES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';

@Component({
  selector: 'app-view-categories',
  templateUrl: './view-categories.component.html',
  styleUrls: ['./view-categories.component.scss'],
})
export class ViewCategoriesComponent  implements OnInit {
  categories: Category[] = [];
  title: string = 'Ver categorías';

  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.dashboardService.getAllItemsCollection(CATEGORIES_COLLECTION_NAME, 'name')
    .subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      error: error => {console.log(error);}
    });
  }

  editCategory(category: any) {
    this.navCtrl.navigateForward(`/dashboard/categories/edit/${category.uid}`);
  }

  deleteCategory(category: Category) {
    /**1. CONSULTAR SI EL REGISTRO ES UTILIZADO EN OTRA COLECCION,
     * 1.2. SI SE USA EN OTRA COLECCION NO SE ELIMINA
     * 1.3. SI NO SE USA EN OTRA COLECCION O EL REGISTRO NO TIENE REFERENCIA EN OTRA COLECCION SE ELIMINA
     * 2. ANTES DE ELIMINAR CUALQUIER REGISTRO SE DEBE MOSTRAR UN DIALOGO PREGUNTANDO AL USUARIO SI ETA SEGURO(SI/NO) */

    // // Utiliza la función deleteDocument de DashboardService para eliminar la categoría
    // this.dashboardService.DeleteDocument(CATEGORIES_COLLECTION_NAME, category.uid)
    //   .then(() => {
    //     // Eliminación exitosa, actualiza la lista de categorías
    //     this.categories = this.categories.filter(c => c.uid !== category.uid);
    //   })
    //   .catch(error => {
    //     console.error('Error al eliminar la categoría:', error);
    //   });
  }

  handleInput(event: any){
    const query = event.target.value.toLowerCase();

    this.dashboardService.searchByArrayString(CATEGORIES_COLLECTION_NAME, 'keywords', query, 'name')
      .subscribe(
        (response: any[]) => {
          console.log(response);
          this.categories = response;
        },
        (error: any) => {
          console.log(error);
        }
      //   {
      //   next: (response: Category[]) => {
      //     this.categories = response;
      //     console.log(response);
      //   },
      //   error: (error: any) => {
      //     console.log(error);
      //   }
      // }
      );
  }

  firstCapitalLetter(cadena: string): string {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
  }

}
