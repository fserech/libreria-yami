import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matCheckCircleOutline, matCloseOutline, matAddCircleOutlineOutline, matPersonOutlineOutline, matSearchOutline } from '@ng-icons/material-icons/outline';
import { ERRORS_FORMCONTROLS } from '../../constants/errors-input';
import { NgIf } from '@angular/common';
import { bootstrapXCircle, bootstrapXCircleFill } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-search-input-text',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgIconComponent],
  templateUrl: './search-input-text.component.html',
  styleUrl: './search-input-text.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [ provideIcons({ matCheckCircleOutline, matCloseOutline, matAddCircleOutlineOutline, matPersonOutlineOutline, matSearchOutline, bootstrapXCircle }) ]
})
export class SearchInputTextComponent implements OnInit, AfterViewInit {

  @Input() options: any = {};
  @Input() icon: string;
  @Input() label: string;
  @Input() placeholder: string;
  @Input() form: FormGroup;
  @Input() name: string;
  @Input() type: string;
  @Input() patternHint = '';
  @Input() required = false;
  @Input() load = false;
  @Input() helpMessage: string;
  @Input() min: number = null;
  @Input() max: number = null;
  @Input() minlength: number = 0;
  @Input() maxlength: number = 0;
  @Input() counter: boolean;
  @Input() filtersActive: boolean;
  @Output() changes = new EventEmitter<string>();
  @Output() clearFilters = new EventEmitter<boolean>();

  constructor(private cdr: ChangeDetectorRef,) {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {}

  cleanFilters(){
    this.clearFilters.emit(true);
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

  isControlDisabled(): boolean {
    const control = this.getFormControl();
    return control.disabled;
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
    const validator = this.form[this.name].validator({} as FormControl);
    if (validator) {
      const maxLengthValidator = validator?.maxLength;
      if (maxLengthValidator) {
        return maxLengthValidator.requiredLength;
      }
      return null;
    }
    return null;
  }

  getValidatorRequired(): boolean{
    return this.getFormControl().hasValidator(Validators.required);
  }

}
