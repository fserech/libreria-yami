import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CancellationSalesComponent } from './components/cancellation-sales/cancellation-sales.component';
import { CancellationShoppingComponent } from './components/cancellation-shopping/cancellation-shopping.component';
import { CancellationStockComponent } from './components/cancellation-stock/cancellation-stock.component';


const routes: Routes = [
  {path: '',component: CancellationSalesComponent },
  {path: 'sale',component: CancellationSalesComponent },
  {path: 'shopping',component: CancellationShoppingComponent },
  {path: 'cancellation-stock',component: CancellationStockComponent },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CancellationsRoutingModule { }
