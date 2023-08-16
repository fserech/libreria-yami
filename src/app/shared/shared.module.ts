import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageWidgetsComponent } from './components/page-widgets/page-widgets.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputComponent } from './components/input/input.component';
import { SelectComponent } from './components/select/select.component';
import { RadioButtonComponent } from './components/radio-button/radio-button.component';
import { ToggleComponent } from './components/toggle/toggle.component';



@NgModule({
  declarations: [
    NotFoundComponent,
    PageWidgetsComponent,
    InputComponent,
    SelectComponent,
    RadioButtonComponent,
    ToggleComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports:[
    IonicModule,
    NotFoundComponent,
    FormsModule,
    ReactiveFormsModule,
    PageWidgetsComponent,
    RouterModule,
    InputComponent,
    SelectComponent,
    RadioButtonComponent,
    ToggleComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
