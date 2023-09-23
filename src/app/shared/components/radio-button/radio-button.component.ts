import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InputIcon, InputOptionsSelect } from '../../models/components/input';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss'],
})
export class RadioButtonComponent  implements OnInit {

  @Input() icon: InputIcon = {
    icon: '',
    show: false
  };
  @Input() options: InputOptionsSelect = {
    label: '',
    value: '',
    resolver: ''
  };
  @Input() label: string;
  @Input() placeholder: string;

  @Input() form: FormGroup;
  @Input() name: string;
  @Input() type: string;

  @Input() disabled = false;
  @Input() required = false;
  @Input() load = false;

  @Input() values: any[] = [];

  @Output() changes = new EventEmitter<string>();

  dataList$: Observable<any[]>;

  constructor(private route: ActivatedRoute) {
    this.values.length > 0 ? this.values : this.dataList$ = this.route.data.pipe(map(data => data[this.options.resolver]));
  }

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

  isControlDisabled(): boolean {
    const control = this.getFormControl();
    return control.disabled;
  }
}
