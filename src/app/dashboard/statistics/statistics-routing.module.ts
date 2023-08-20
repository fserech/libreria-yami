import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KpiSalesComponent } from './components/kpi-sales/kpi-sales.component';
import { KpiShoppingComponent } from './components/kpi-shopping/kpi-shopping.component';
import { KpiEarningsComponent } from './components/kpi-earnings/kpi-earnings.component';
import { KpiLossesComponent } from './components/kpi-losses/kpi-losses.component';

const routes: Routes = [
  {path: '',component: KpiSalesComponent },
  {path: 'kpi-sales',component: KpiSalesComponent },
  {path: 'kpi-shopping',component: KpiShoppingComponent },
  {path: 'earnings',component: KpiEarningsComponent },
  {path: 'loses',component: KpiLossesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticsRoutingModule { }
