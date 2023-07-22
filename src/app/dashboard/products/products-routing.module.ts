import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewProductComponent } from './components/new-product/new-product.component';
import { ViewProductsComponent } from './components/view-products/view-products.component';


const routes: Routes = [
  {path: '',component: NewProductComponent },
  {path: 'new-product',component: NewProductComponent },
  {path: 'view-all-products',component: ViewProductsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
