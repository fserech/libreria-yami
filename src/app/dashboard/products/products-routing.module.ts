import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewProductComponent } from './components/new-product/new-product.component';
import { ViewProductsComponent } from './components/view-products/view-products.component';


const routes: Routes = [
  {path: '',component: NewProductComponent },
  {path: 'all',component: ViewProductsComponent },
  {path: ':mode/:uid', component: NewProductComponent },
  {path: ':mode', component: NewProductComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
