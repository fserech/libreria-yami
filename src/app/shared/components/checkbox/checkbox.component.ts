import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {MatCardModule} from '@angular/material/card';
import {MatRadioModule} from '@angular/material/radio';


@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgIf, NgIconComponent, MatCardModule, MatCheckboxModule, FormsModule, MatRadioModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CheckboxComponent implements OnInit, AfterViewInit{

  @Input() label: string;
  @Input() labels: string[];
  @Input() form: FormGroup;
  @Input() name: string;
  @Input() load: boolean;
  @Output() changes = new EventEmitter<FormArray>();

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.setCheckboxes();
  }

  setCheckboxes() {
    const formArray = this.form.get(this.name) as FormArray;
    formArray.valueChanges.subscribe(() => this.onCheckboxChange());
  }

  onCheckboxChange() {
    const formArray = this.form.get(this.name) as FormArray;
    this.changes.emit(formArray);
  }

  get formArrayOptions() {
    return (this.form.get(this.name) as FormArray).controls.map((control, index) => ({
      value: control.value,
      label: this.labels[index]
    }));
  }
}





