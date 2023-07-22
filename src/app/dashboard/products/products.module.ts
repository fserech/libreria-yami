import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NewProductComponent } from './components/new-product/new-product.component';
import { ViewProductsComponent } from './components/view-products/view-products.component';


@NgModule({
  declarations: [
    NewProductComponent,
    ViewProductsComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    SharedModule
  ]
})
export class ProductsModule { }
