import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../../shared/components/select/select.component';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { REGUEX_INT } from '../../../../../shared/constants/reguex';
import { DialogData } from '../../../../../shared/interfaces/dialog-data';
import { Product } from '../../../../../shared/interfaces/product';
import { ToastService } from '../../../../../shared/services/toast.service';
import { DELIVERY_TRANSPORTATION } from '../../../../../shared/constants/panels';
import { Panel } from '../../../../../shared/interfaces/panel';

@Component({
  selector: 'app-data-order-dialog',
  standalone: true,
  imports: [FormsModule, InputComponent, SelectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './data-order-dialog.component.html',
  styleUrl: './data-order-dialog.component.scss'
})
export class DataOrderDialogComponent {

  form: FormGroup;
  load: boolean = false;
  transportsDetail: Panel[] = DELIVERY_TRANSPORTATION;
  transports: { value: string, label: string}[] = [];

  constructor(@Inject(DIALOG_DATA) public data: DialogData,
  public dialogRef: DialogRef,
  private toast: ToastService){
    this.transportsDetail.forEach((panel: Panel) => {
      const record = {
        value: panel.key,
        label: panel.label
      }
      this.transports.push(record);
    });

    this.form = new FormGroup({
      panel: new FormControl('', [  Validators.required]),
      observation: new FormControl('', [])
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  ok(): void {
    const data = {
      panel: this.form.controls['panel'].value,
      observation: (this.form.controls['observation'].value && this.form.controls['observation'].value !== '') ? this.form.controls['observation'].value : null
    };
    this.dialogRef.close(data);
  }
}
