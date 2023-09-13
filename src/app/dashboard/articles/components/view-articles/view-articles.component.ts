import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ARTICLES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { Article } from 'src/app/shared/models/article';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';

@Component({
  selector: 'app-view-articles',
  templateUrl: './view-articles.component.html',
  styleUrls: ['./view-articles.component.scss'],
})
export class ViewArticlesComponent  implements OnInit {

  articles: Article[] = [];
  title: string = 'Ver Insumos';


  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.dashboardService.getAllItemsCollection(ARTICLES_COLLECTION_NAME, 'name')
    .subscribe({
      next: (articles: Article[]) => {
        this.articles = articles;
      },
      error: error => {console.log(error);}
    });
  }

  editArticle(article: any) {
    this.navCtrl.navigateForward(`/dashboard/articles/edit/${article.uid}`);


  }

  deleteArticle(article: Article) {
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

    this.dashboardService.searchByArrayString(ARTICLES_COLLECTION_NAME, 'keywords', query, 'name')
      .subscribe({
        next: (response: Article[]) => {
          this.articles = response;
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
