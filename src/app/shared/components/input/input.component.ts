import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { InputIcon } from '../../models/components/input';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {

  @Input() options: any = {};

  @Input() icon: InputIcon = {
    icon: '',
    show: false
  };
  @Input() label: string;
  @Input() placeholder: string;

  @Input() form: FormGroup;
  @Input() name: string;
  @Input() type: string;
  @Input() patternHint = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() help: string;

  @Output() changes = new EventEmitter<string>();

  constructor() {
  }

  ngOnInit() {
  }

  onInputChange(event: any) {
    this.changes.emit(event);
  }

  getFormControl(): FormControl {
    const control = this.form.get(this.name) as FormControl;
    if (control) {
      return control;
    } else {
      throw new Error(`No se encontró el control con el nombre '${this.name}' en el formulario.`);
    }
  }

}
