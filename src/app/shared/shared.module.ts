import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageWidgetsComponent } from './components/page-widgets/page-widgets.component';



@NgModule({
  declarations: [
    NotFoundComponent,
    PageWidgetsComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports:[
    IonicModule,
    NotFoundComponent,
    FormsModule,
    ReactiveFormsModule,
    PageWidgetsComponent
  ]
})
export class SharedModule { }
