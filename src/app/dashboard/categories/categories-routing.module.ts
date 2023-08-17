import { NgModule } from '@angular/core';
import { NewCategoryComponent } from './components/new-category/new-category.component';
import { RouterModule, Routes } from '@angular/router';
import { ViewCategoriesComponent } from './components/view-categories/view-categories.component';

const routes: Routes = [
  {path: '',component: NewCategoryComponent },
  {path: 'new',component: NewCategoryComponent },
  {path: 'all',component: ViewCategoriesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriesRoutingModule { }
