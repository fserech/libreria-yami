import { NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import 'moment/locale/es';
import {default as _rollupMoment} from 'moment';
import * as _moment from 'moment';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matAddCircleOutlineOutline, matCheckCircleOutline, matCloseOutline, matPersonOutline, matPersonOutlineOutline, matSearchOutline, matTodayOutline } from '@ng-icons/material-icons/outline';
import { bootstrapXCircle } from '@ng-icons/bootstrap-icons';
import { MatIcon } from '@angular/material/icon';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [FormsModule, NgClass, NgIf, NgFor,
            MatFormFieldModule, MatInputModule, MatDatepickerModule,
            ReactiveFormsModule, NgIconComponent, MatIcon],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  providers: [provideNativeDateAdapter(), provideMomentDateAdapter(MY_FORMATS),
              provideIcons({ matCheckCircleOutline, matAddCircleOutlineOutline })
            ],
})

export class DatePickerComponent implements OnInit, AfterViewInit {

  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
  @Input() icon: string;
  @Input() placeholder: string = 'Selecciona fecha';
  @Input() form: FormGroup;
  @Input() name: string;
  @Input() patternHint = '';
  @Input() load = false;
  @Input() minDate: Date;
  @Input() maxDate: Date;
  @Input() clear: boolean = false;
  @Output() changes = new EventEmitter<string>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onInputChange(event: any) {
    this.changes.emit(event);
  }

  ngOnInit(): void {}

  getFormControl(): FormControl {
    const control = this.form.get(this.name) as FormControl;
    if (control) {
      return control;
    } else {
      throw new Error(`No se encontró el control con el nombre '${this.name}' en el formulario.`);
    }
  }

  getValidatorRequired(): boolean{
    return this.getFormControl().hasValidator(Validators.required);
  }

  onDateSelected(event: any): void {
    const selectedDate = event.value;
    const control = this.form.get(this.name);
    if (control) {
      if (selectedDate) {
        control.setValue(selectedDate);
        control.markAsDirty();
        control.updateValueAndValidity();
      } else {
        control.reset(); // Si no se selecciona ninguna fecha, reinicia el valor del control
      }
    }
  }

  open(){
    this.datepicker.open()
  }
}
