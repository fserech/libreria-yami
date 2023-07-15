import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewCategoryComponent } from './components/new-category/new-category.component';
import { ViewCategoriesComponent } from './components/view-categories/view-categories.component';

const routes: Routes = [
  {path: '',component: NewCategoryComponent },
  {path: 'new-category',component: NewCategoryComponent },
  {path: 'view-all-categories',component: ViewCategoriesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriesRoutingModule { }
