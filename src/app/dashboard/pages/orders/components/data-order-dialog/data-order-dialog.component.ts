import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../../shared/components/select/select.component';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DialogData } from '../../../../../shared/interfaces/dialog-data';
import { ToastService } from '../../../../../shared/services/toast.service';
import { Branch } from '../../../../../shared/interfaces/branch';
import { CrudService } from '../../../../../shared/services/crud.service';
import { URL_BRANCHES } from '../../../../../shared/constants/endpoints';
import { firstValueFrom } from 'rxjs';
import { NgClass } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matRefreshOutline } from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-data-order-dialog',
  standalone: true,
  imports: [FormsModule, InputComponent, SelectComponent, NgClass, NgIconComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './data-order-dialog.component.html',
  styleUrl: './data-order-dialog.component.scss',
  viewProviders: [provideIcons({ matRefreshOutline })]
})
export class DataOrderDialogComponent implements OnInit {
  form: FormGroup;
  load: boolean = false;
  branches: { value: number, label: string, address: string, telephone: string }[] = [];
  branchesData: Branch[] = [];

  // ✅ MENSAJES DE AGRADECIMIENTO PREDEFINIDOS
  thankYouMessages: string[] = [
    '¡Gracias por su compra!',
    '¡Gracias por preferirnos!',
    '¡Gracias por su confianza!',
    '¡Apreciamos su visita!',
    '¡Gracias por elegirnos!',
    '¡Es un placer atenderle!',
    '¡Vuelva pronto!',
    '¡Gracias por su visita!',
    '¡Fue un gusto servirle!',
    '¡Gracias, esperamos verle pronto!'
  ];

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
    // ✅ Establecer mensaje aleatorio al iniciar
    this.setRandomThankYouMessage();
  }

  /**
   * ✅ ESTABLECER MENSAJE DE AGRADECIMIENTO ALEATORIO
   */
  setRandomThankYouMessage(): void {
    const randomIndex = Math.floor(Math.random() * this.thankYouMessages.length);
    const randomMessage = this.thankYouMessages[randomIndex];
    this.form.controls['observation'].setValue(randomMessage);
  }

  /**
   * ✅ GENERAR NUEVO MENSAJE ALEATORIO
   */
  generateNewMessage(): void {
    this.setRandomThankYouMessage();
  }

  async loadBranches(): Promise<void> {
    this.load = true;
    this.crud.baseUrl = URL_BRANCHES;
    try {
      const response: any = await this.crud.getAll('');
      this.branchesData = response.data || response;

      // Convertir las sucursales al formato que necesita el select
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
      this.toast.warning('Debe seleccionar una sucursal');
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
