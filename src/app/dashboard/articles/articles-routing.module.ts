import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewArticleComponent } from './components/new-article/new-article.component';
import { ViewArticlesComponent } from './components/view-articles/view-articles.component';
import { CategoriesResolver } from '../../shared/resolvers/categories.resolver';

const routes: Routes = [
  {path: '',component: NewArticleComponent },
  {path: 'all',component: ViewArticlesComponent },
  {path: ':mode/:uid', component: NewArticleComponent , resolve: {categories: CategoriesResolver}  },
  {path: ':mode', component: NewArticleComponent , resolve: {categories: CategoriesResolver} },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticlesRoutingModule { }
