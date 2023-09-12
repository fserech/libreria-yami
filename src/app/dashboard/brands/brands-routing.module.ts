import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewCategoriesComponent } from '../categories/components/view-categories/view-categories.component';
import { AddEditBrandComponent } from './components/add-edit-brand/add-edit-brand.component';
import { ViewAllBrandComponent } from './components/view-all-brand/view-all-brand.component';

const routes: Routes = [
  {path: '',component: AddEditBrandComponent },
  {path: 'all',component: ViewCategoriesComponent },
  {path: ':mode/:uid', component: ViewAllBrandComponent },
  {path: ':mode', component: AddEditBrandComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BrandsRoutingModule { }
