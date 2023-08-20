import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewArticleComponent } from './components/new-article/new-article.component';
import { ViewArticlesComponent } from './components/view-articles/view-articles.component';
import { CategoriesResolver } from './resolvers/categories.resolver';

const routes: Routes = [
  {path: '',component: NewArticleComponent },
  {path: 'new',component: NewArticleComponent, resolve: {categories: CategoriesResolver} },
  {path: 'all',component: ViewArticlesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticlesRoutingModule { }
