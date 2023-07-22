import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoryShoppingComponent } from './components/history-shopping/history-shopping.component';
import { NewShoppingComponent } from './components/new-shopping/new-shopping.component';

const routes: Routes = [
  {path: '', component: HistoryShoppingComponent},
  {path: 'history-shopping', component: HistoryShoppingComponent},
  {path: 'new-shopping', component: NewShoppingComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShoppingRoutingModule { }
