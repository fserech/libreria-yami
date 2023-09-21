import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditBrandComponent } from './components/add-edit-brand/add-edit-brand.component';
import { ViewAllBrandComponent } from './components/view-all-brand/view-all-brand.component';
import { CategoriesResolver } from '../articles/resolvers/categories.resolver';



const routes: Routes = [
  {path: '',component: AddEditBrandComponent },
  {path: 'all',component: ViewAllBrandComponent },
  {path: ':mode/:uid', component: AddEditBrandComponent, resolve: {categories: CategoriesResolver} },
  {path: ':mode', component: AddEditBrandComponent, resolve: {categories: CategoriesResolver} }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
 
   
})
export class BrandsRoutingModule { }
