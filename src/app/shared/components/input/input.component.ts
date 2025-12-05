import { NgIf } from '@angular/common';
import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, input } from '@angular/core';
import { FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { ERRORS_FORMCONTROLS } from '../../constants/errors-input';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { mat30fpsOutline, matAddCircleOutlineOutline, matAddIcCallOutline, matAddLocationAltOutline, matAttachMoneyOutline, matCheckCircleOutline, matCloseOutline, matDriveFileRenameOutlineOutline, matFilter2Outline, matInsertCommentOutline, matMoneyOutline, matPersonOutlineOutline, matSearchOutline } from '@ng-icons/material-icons/outline';
import { bootstrapPostcardFill } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgIconComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.Default,
  viewProviders: [ provideIcons({ matCheckCircleOutline, matCloseOutline, matAddCircleOutlineOutline,
                   matPersonOutlineOutline, matSearchOutline, matMoneyOutline, matDriveFileRenameOutlineOutline,
                   matAttachMoneyOutline, bootstrapPostcardFill, matAddLocationAltOutline, matAddIcCallOutline,
                   mat30fpsOutline, matFilter2Outline, matInsertCommentOutline }) ]
})
export class InputComponent implements OnInit, AfterViewInit {

  @Input() options: any = {};
  @Input() iconLeft: string;
  @Input() iconRight: string;
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
  @Output() changes = new EventEmitter<string>();
  @Output() viewPassword = new EventEmitter<boolean>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {}

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

  viewPass(){
    this.viewPassword.emit(true);
  }
}
