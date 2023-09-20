import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewProductComponent } from './components/new-product/new-product.component';
import { ViewProductsComponent } from './components/view-products/view-products.component';
import { CategoriesResolver } from '../articles/resolvers/categories.resolver';


const routes: Routes = [
  {path: '',component: NewProductComponent },
  {path: 'all',component: ViewProductsComponent },
  {path: ':mode/:uid', component: NewProductComponent, resolve: {categories: CategoriesResolver} },
  {path: ':mode', component: NewProductComponent, resolve: {categories: CategoriesResolver} }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
