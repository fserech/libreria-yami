import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss'
})
export class ToggleComponent implements OnInit, AfterViewInit {

  @Input() label: string;
  @Input() form: FormGroup;
  @Input() name: string;
  @Input() load = false;
  @Output() changes = new EventEmitter<any>();

  constructor(private cdr: ChangeDetectorRef){}

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

  handleChange(ev): void {
    this.changes.emit(ev);
  }

}
