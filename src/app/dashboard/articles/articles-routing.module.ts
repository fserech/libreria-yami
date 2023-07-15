import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewArticleComponent } from './components/new-article/new-article.component';
import { ViewArticlesComponent } from './components/view-articles/view-articles.component';

const routes: Routes = [
  {path: '',component: NewArticleComponent },
  {path: 'new-article',component: NewArticleComponent },
  {path: 'view-all-articles',component: ViewArticlesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticlesRoutingModule { }
