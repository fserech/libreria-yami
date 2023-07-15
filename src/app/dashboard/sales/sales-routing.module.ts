import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewSaleComponent } from './components/new-sale/new-sale.component';
import { HistorySalesComponent } from './components/history-sales/history-sales.component';
import { MySalesComponent } from './components/my-sales/my-sales.component';

const routes: Routes = [
  {path: '', component: NewSaleComponent},
  {path: 'new-sale', component: NewSaleComponent},
  {path: 'my-sales', component: MySalesComponent},
  {path: 'history-sales', component: HistorySalesComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
