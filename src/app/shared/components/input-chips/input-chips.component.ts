import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-input-chips',
  templateUrl: './input-chips.component.html',
  styleUrls: ['./input-chips.component.scss'],
})
export class InputChipsComponent  implements OnInit, OnChanges {

  @Input() label: string;
  @Input() values: string[];
  @Input() labelButton: string = 'Agregar';
  @Input() placeholder: string;
  @Input() form: FormGroup;
  @Input() name: string;
  @Input() disabled = false;
  @Input() required = false;
  @Input() load = false;
  @Output() changes = new EventEmitter<string[]>();
  chips: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['values']) {
      const newValues = changes['values'].currentValue as string[];
      this.chips = newValues ? newValues : [];
      this.changed();
    }
  }

  constructor() { }

  ngOnInit() {
    console.log(this.values);
    this.values.length > 0 ? this.chips = this.values : this.chips = [];
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

  addChip() {
    const value = this.getFormControl().value;

    if(value){
      const value = this.getFormControl().value.trim();
    if(value !== '' && value !== null && value !== undefined && !this.chips.includes(value.toLowerCase())){
      this.chips.push(value);
    }
    this.getFormControl().setValue('');
    }
    this.changed();
  }

  removeChip(chip: string) {
    if(chip !== ''){
      const index = this.chips.indexOf(chip);
      if (index !== -1) {
        this.chips.splice(index, 1);
      }
    }
    this.changed();
  }

  trackByFn(item) {
    return item;
  }

  changed(){
    this.changes.emit(this.chips);
  }
}
