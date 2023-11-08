import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatisticsRoutingModule } from './statistics-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { KpiSalesComponent } from './components/kpi-sales/kpi-sales.component';
import { KpiShoppingComponent } from './components/kpi-shopping/kpi-shopping.component';
import { KpiEarningsComponent } from './components/kpi-earnings/kpi-earnings.component';
import { KpiLossesComponent } from './components/kpi-losses/kpi-losses.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';

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
    SharedModule,
    NgxChartsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StatisticsModule { }
