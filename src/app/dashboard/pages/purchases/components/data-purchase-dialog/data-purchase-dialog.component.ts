import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../../shared/components/select/select.component';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DialogData } from '../../../../../shared/interfaces/dialog-data';
import { ToastService } from '../../../../../shared/services/toast.service';
import { Branch } from '../../../../../shared/interfaces/branch';
import { CrudService } from '../../../../../shared/services/crud.service';
import { URL_BRANCHES } from '../../../../../shared/constants/endpoints';
import { provideIcons } from '@ng-icons/core';
import { matRefreshOutline } from '@ng-icons/material-icons/outline';


@Component({
  selector: 'app-data-purchase-dialog',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, InputComponent, SelectComponent], // ✅ Agregar ReactiveFormsModule
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './data-purchase-dialog.component.html',
  styleUrl: './data-purchase-dialog.component.scss',
  viewProviders: [provideIcons({ matRefreshOutline })]
})
export class DataPurchaseDialogComponent implements OnInit {
  form: FormGroup;
  load: boolean = false;
  branches: { value: number, label: string, address: string, telephone: string }[] = [];
  branchesData: Branch[] = [];

  constructor(
    @Inject(DIALOG_DATA) public data: DialogData,
    public dialogRef: DialogRef,
    private toast: ToastService,
    private crud: CrudService
  ){
    this.form = new FormGroup({
      idBranch: new FormControl(null, [Validators.required]),
      observation: new FormControl('', [])
    });
  }

  ngOnInit(): void {
    this.loadBranches();
  }

  async loadBranches(): Promise<void> {
    this.load = true;
    this.crud.baseUrl = URL_BRANCHES;
    try {
      const response: any = await this.crud.getAll('');
      this.branchesData = response.data || response;
      this.branches = this.branchesData
        .filter((branch: Branch) => branch.active !== false)
        .map((branch: Branch) => ({
          value: branch.id!,
          label: branch.name,
          address: branch.address || '',
          telephone: branch.telephone || ''
        }));
      if (this.branches.length === 0) {
        this.toast.warning('No hay sucursales disponibles. Por favor, cree una sucursal primero.');
      }
    } catch (error: any) {
      console.error('Error al cargar sucursales:', error);
      this.toast.error('Error al cargar las sucursales');
    } finally {
      this.load = false;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  ok(): void {
    if (this.form.invalid) {
      if (!this.form.controls['idBranch'].value) {
        this.toast.warning('Debe seleccionar una sucursal');
      }
      return;
    }

    const selectedBranchId = this.form.controls['idBranch'].value;
    const selectedBranch = this.branchesData.find(b => b.id === selectedBranchId);

    if (!selectedBranch) {
      this.toast.error('Sucursal no encontrada');
      return;
    }

    const data = {
      idBranch: selectedBranch.id!,
      branchName: selectedBranch.name,
      branchAddress: selectedBranch.address || '',
      branchTelephone: selectedBranch.telephone || '',
      observation: (this.form.controls['observation'].value && this.form.controls['observation'].value !== '')
        ? this.form.controls['observation'].value
        : ''
    };

    this.dialogRef.close(data);
  }
}
