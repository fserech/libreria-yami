import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { InputIcon } from '../../models/components/input';
import { IonInput, IonModal, ModalController } from '@ionic/angular';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent  implements OnInit {

  @ViewChild('modal') modal: IonModal;
  @ViewChild('input') input: IonInput;

  @Input() min: string;
  @Input() max: string;


  @Input() showTime: boolean;
  @Input() label: string;
  @Input() placeholder: string;

  @Input() form: FormGroup;
  @Input() name: string;
  @Input() disabled = false;
  @Input() required = false;
  @Input() load = false;

  @Output() changes = new EventEmitter<any>();

  icon: string = 'calendar-outline';
  formattedDate: string = '';
  currentValue: any;

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
    this.modal.dismiss();
    if(this.showTime )this.changes.emit(this.currentValue);
  }

  changeDate($event: any){
    if(this.showTime){
      this.changes.emit($event);
      const value = new Date(this.getFormControl().value);
      this.formattedDate = this.getDateString(value);
      this.currentValue = $event;
    }else{
      this.changes.emit($event);
      const value = new Date(this.getFormControl().value);
      this.formattedDate = this.getDateString(value);
      this.closeModal();
    }
  }

  getDateString(date: Date): string{
    let dateString = '';
    if(this.showTime){
      const day = this.formatNumberWithLeadingZero(date.getDate());
      const month = this.getMonthName(date.getMonth());
      const year = date.getFullYear();
      const time = this.datePipe.transform(date, 'hh:mm a');
      dateString = `${day} / ${month} / ${year} - ${time}`;
    }else{
      const day = this.formatNumberWithLeadingZero(date.getDate());
      const month = this.getMonthName(date.getMonth());
      const year = date.getFullYear();
      dateString = `${day} / ${month} / ${year}`;
    }
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
