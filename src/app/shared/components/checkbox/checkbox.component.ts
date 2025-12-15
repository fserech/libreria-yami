import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { matCheckCircleOutline, matAddCircleOutlineOutline, matDriveFileRenameOutlineOutline } from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgIconComponent,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  viewProviders: [
    provideIcons({
      matCheckCircleOutline,
      matAddCircleOutlineOutline,
      matDriveFileRenameOutlineOutline
    })
  ]
})
export class CheckboxComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() icon: string;
  @Input() label: string;
  @Input() labels: string[] = [];
  @Input() form: FormGroup;
  @Input() name: string;
  @Input() load: boolean;
  @Input() placeholder: string = 'Selecciona opciones';
  @Output() changes = new EventEmitter<FormArray>();

  selectControl = new FormControl([]);

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.syncSelectWithFormArray();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['labels'] && !changes['labels'].firstChange) {
      console.log(`${this.name} - Labels actualizados:`, this.labels);
      this.syncSelectWithFormArray();
    }
  }

  syncSelectWithFormArray() {
    const formArray = this.form.get(this.name) as FormArray;
    if (!formArray) return;

    const initialSelected: number[] = [];
    formArray.controls.forEach((control, index) => {
      if (control.value === true) {
        initialSelected.push(index);
      }
    });

    console.log(`${this.name} - Selected indices:`, initialSelected);
    console.log(`${this.name} - Labels:`, this.labels);

    this.selectControl.setValue(initialSelected);

    this.selectControl.valueChanges.subscribe((selectedIndexes: number[]) => {
      formArray.controls.forEach((control, index) => {
        control.setValue(selectedIndexes.includes(index), { emitEvent: false });
      });
      this.changes.emit(formArray);
    });
  }

  get formArrayOptions() {
    return this.labels.map((label, index) => ({
      label: label,
      index: index
    }));
  }

  get isValid(): boolean {
    const formArray = this.form.get(this.name) as FormArray;
    return formArray && formArray.controls.some(control => control.value === true);
  }

  get selectedCount(): number {
    const formArray = this.form.get(this.name) as FormArray;
    return formArray ? formArray.controls.filter(control => control.value === true).length : 0;
  }

  isOptionSelected(index: number): boolean {
    const formArray = this.form.get(this.name) as FormArray;
    return formArray && formArray.at(index) ? formArray.at(index).value === true : false;
  }

  getSelectedLabels(): string {
    const selectedLabels = this.formArrayOptions
      .filter(opt => this.isOptionSelected(opt.index))
      .map(opt => opt.label)
      .join(', ');

    return selectedLabels || this.placeholder;
  }
}
