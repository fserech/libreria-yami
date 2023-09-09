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
  title: string = 'Ver articulos';
  

  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    // Llama a la función getArticleDocuments
    this.dashboardService.getAllItemsCollection(ARTICLES_COLLECTION_NAME)
    .subscribe({
      next: (articles: Article[]) => {
        console.log('articles: ', articles);
        this.articles = articles;
      },
      error: error => {console.log(error);}
    });
  }

  editArticles(article: any) {
    this.navCtrl.navigateForward('/edit-article', { state: { article } });
  }

  handleInput(event: any){
    const query = event.target.value.toLowerCase();
    this.dashboardService.findItemsCollection(ARTICLES_COLLECTION_NAME, 'keywords', query)
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
