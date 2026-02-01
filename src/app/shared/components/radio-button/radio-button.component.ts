import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-radio-button',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgIf, NgIconComponent, MatRadioModule],
  templateUrl: './radio-button.component.html',
  styleUrl: './radio-button.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class RadioButtonComponent implements OnInit, AfterViewInit{

  @Input() form: FormGroup;
  @Input() name: string;
  @Input() load: boolean;
  @Input() options: { label: string, value: any}[] = [];
  @Input() label: string;
  @Output() changes = new EventEmitter<MatRadioChange>();
  myFormControl = new FormControl();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
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

  change(event: MatRadioChange) {
    this.changes.emit(event);
  }

  }




