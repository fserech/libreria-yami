import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArticlesRoutingModule } from './articles-routing.module';
import { NewArticleComponent } from './components/new-article/new-article.component';
import { ViewArticlesComponent } from './components/view-articles/view-articles.component';


@NgModule({
  declarations: [
    NewArticleComponent,
    ViewArticlesComponent],
  imports: [
    CommonModule,
    ArticlesRoutingModule
  ]
})
export class ArticlesModule { }
