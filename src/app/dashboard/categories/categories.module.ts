import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriesRoutingModule } from './categories-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NewCategoryComponent } from './components/new-category/new-category.component';
import { ViewCategoriesComponent } from './components/view-categories/view-categories.component';


@NgModule({
  declarations: [
    NewCategoryComponent,
    ViewCategoriesComponent
  ],
  imports: [
    CommonModule,
    CategoriesRoutingModule,
    SharedModule
  ]
})
export class CategoriesModule { }
