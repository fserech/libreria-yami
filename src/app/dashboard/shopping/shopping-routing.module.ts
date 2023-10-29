import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoryShoppingComponent } from './components/history-shopping/history-shopping.component';
import { NewShoppingComponent } from './components/new-shopping/new-shopping.component';
import { BrandsResolver } from 'src/app/shared/resolvers/brands.resolver';

const routes: Routes = [
  {path: '', component: HistoryShoppingComponent},
  {path: 'all', component: HistoryShoppingComponent},
  {path: 'new', component: NewShoppingComponent,
  resolve: { brands: BrandsResolver }}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShoppingRoutingModule { }
