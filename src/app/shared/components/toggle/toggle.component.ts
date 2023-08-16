import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
})
export class ToggleComponent  implements OnInit {

  @Input() label: string = '';
  @Input() disabled = false;
  @Input() load = false;

  @Input() form: FormGroup;
  @Input() name: string;

  @Output() changes = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {}

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
