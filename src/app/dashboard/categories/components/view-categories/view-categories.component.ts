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
    // Llama a la función getCategorieDocuments
    this.dashboardService.getAllItemsCollection(CATEGORIES_COLLECTION_NAME)
    .subscribe({
      next: (categories: Category[]) => {
        console.log('categories: ', categories);
        this.categories = categories;
      },
      error: error => {console.log(error);}
    });
  }

  editCategory(category: any) {
    // Navega a la página 'new-category' y pasa el ID de la categoría como parte de la URL
    this.navCtrl.navigateForward(`/dashboard/categories/edit/${category.uid}`);


  }

  deleteCategory(category: Category) {
    // Utiliza la función deleteDocument de DashboardService para eliminar la categoría
    this.dashboardService.DeleteDocument(CATEGORIES_COLLECTION_NAME, category.uid)
      .then(() => {
        // Eliminación exitosa, actualiza la lista de categorías
        this.categories = this.categories.filter(c => c.uid !== category.uid);
      })
      .catch(error => {
        console.error('Error al eliminar la categoría:', error);
      });
  }

  handleInput(event: any){
    const query = event.target.value.toLowerCase();
    this.dashboardService.findItemsCollection(CATEGORIES_COLLECTION_NAME, 'keywords', query)
      .subscribe({
        next: (response: Category[]) => {
          this.categories = response;
        },
        error: (error: any) => {
          console.log(error);
        }
      });
  }

  firstCapitalLetter(cadena: string): string {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
  }

}
