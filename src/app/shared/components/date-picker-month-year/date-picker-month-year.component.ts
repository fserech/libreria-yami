import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { InputIcon } from '../../models/components/input';
import { IonInput, IonModal, ModalController } from '@ionic/angular';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-date-picker-month-year',
  templateUrl: './date-picker-month-year.component.html',
  styleUrls: ['./date-picker-month-year.component.scss'],
})
export class DatePickerMonthYearComponent  implements OnInit {

  @ViewChild('modal') modal: IonModal;
  @ViewChild('input') input: IonInput;

  @Input() min: string;
  @Input() max: string;

  @Input() label: string;
  @Input() presentation: 'month-year' | 'year' = 'month-year';
  @Input() labelButton: string = 'Listo';
  @Input() placeholder: string;

  @Input() form: FormGroup;
  @Input() name: string;
  @Input() disabled = false;
  @Input() required = false;
  @Input() load = false;

  @Output() changes = new EventEmitter<any>();

  icon: string = 'calendar-outline';
  formattedDate: string = '';
  currentValue: any = null;

  constructor(private datePipe: DatePipe) {
  }

  ngOnInit() {
    const date = new Date();
    this.formattedDate = this.getDateString(date);
    this.getFormControl().setValue(date.toISOString());
  }

  getFormControl(): FormControl {
    const control = this.form.get(this.name) as FormControl;
    if (control) {
      return control;
    } else {
      throw new Error(`No se encontró el control con el nombre '${this.name}' en el formulario.`);
    }
  }

  openModal(){
    this.modal.present()
  }

  closeModal(){
    if(this.currentValue !== null && this.currentValue !== undefined)this.changes.emit(this.currentValue);
    this.modal.dismiss();
  }

  changeDate($event: any){
      const value = new Date(this.getFormControl().value);
      this.formattedDate = this.getDateString(value);
      this.currentValue = $event;
      this.changes.emit($event);
  }

  getDateString(date: Date): string{
    let dateString = '';

    const day = this.formatNumberWithLeadingZero(date.getDate());
    const month = this.getMonthName(date.getMonth());
    const year = date.getFullYear();
    this.presentation === 'month-year' ? dateString = `${month} / ${year}`: dateString = `${year}`;
    return dateString;
  }

  private formatNumberWithLeadingZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  private getMonthName(month: number): string {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[month];
  }
}
