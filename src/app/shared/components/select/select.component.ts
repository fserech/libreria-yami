
import { CommonModule } from '@angular/common';
import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { bootstrapTruck, bootstrapXCircle } from '@ng-icons/bootstrap-icons';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matCheckCircleOutline, matCloseOutline, matAddCircleOutlineOutline, matPersonOutlineOutline, matSearchOutline, matTodayOutline, matPersonOutline, matRuleOutline } from '@ng-icons/material-icons/outline';
import { ERRORS_FORMCONTROLS } from '../../constants/errors-input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [ ReactiveFormsModule, CommonModule, FormsModule,
             MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, NgIconComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.Default,
  viewProviders: [ provideIcons({ matCheckCircleOutline, matCloseOutline, matAddCircleOutlineOutline,
     matPersonOutlineOutline, matSearchOutline, bootstrapXCircle, matTodayOutline, matPersonOutline,
     bootstrapTruck, matRuleOutline }) ]
})
export class SelectComponent implements OnInit, AfterViewInit {
  @Input() options: { value: any, label: string }[];
  @Input() icon: string;
  @Input() label: string;
  @Input() placeholder: string;
  @Input() form: FormGroup;
  @Input() name: string;
  @Input() type: string;
  @Input() required = false;
  @Input() load = false;
  @Output() changes = new EventEmitter<string>();
  errorMessage: any;

  constructor( private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onInputChange(event: any) {
    this.changes.emit(event);
  }

  getSelectedLabel(value: string): string {
    const selectedOption = this.options.find(option => option.value === value);
    return selectedOption ? selectedOption.label : '';
  }

  getErrors() {
    const control = this.getFormControl();
    if (control) {
      const errors = control.errors;
      if (errors) {
        const errorKeys = Object.keys(errors);
        const errorLabels = [];
        errorKeys.forEach(key => {
          const error = ERRORS_FORMCONTROLS.find(item => item.key === key);

          if (error) {
            errorLabels.push(error.label);
          }
        });
        return errorLabels;
      }
    }
    return null;
  }

  getMaxLength(): number {
    const validator = this.form.get(this.name).validator({} as FormControl);
    if (validator) {
      const maxLengthValidator = validator['maxLength'];
      if (maxLengthValidator) {
        return maxLengthValidator.requiredLength;
      }
      return null;
    }
    return null;
  }

  onChange(event: any): void {
    const selectedValue = event.target.value;
    const selectedOption = this.options.find(option => option.value === selectedValue);
    if (selectedOption) {
      this.changes.emit(selectedOption.label);
    }
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

  getValidatorRequired(): boolean {
    return this.getFormControl().hasValidator(Validators.required);
  }
}
