import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrandsRoutingModule } from './brands-routing.module';
import { AddEditBrandComponent } from './components/add-edit-brand/add-edit-brand.component';
import { ViewAllBrandComponent } from './components/view-all-brand/view-all-brand.component';
import { SharedModule } from "../../shared/shared.module";


@NgModule({
    declarations: [
        ViewAllBrandComponent,
        AddEditBrandComponent
    ],
    imports: [
        CommonModule,
        BrandsRoutingModule,
        SharedModule
    ]
})
export class BrandsModule { }
