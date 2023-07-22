import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatisticsRoutingModule } from './statistics-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { KpiSalesComponent } from './components/kpi-sales/kpi-sales.component';
import { KpiShoppingComponent } from './components/kpi-shopping/kpi-shopping.component';
import { KpiEarningsComponent } from './components/kpi-earnings/kpi-earnings.component';
import { KpiLossesComponent } from './components/kpi-losses/kpi-losses.component';


@NgModule({
  declarations: [
    KpiSalesComponent,
    KpiShoppingComponent,
    KpiEarningsComponent,
    KpiLossesComponent
  ],
  imports: [
    CommonModule,
    StatisticsRoutingModule,
    SharedModule
  ]
})
export class StatisticsModule { }
