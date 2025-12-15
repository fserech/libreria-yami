import { Component, OnInit } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matArrowBackOutline } from '@ng-icons/material-icons/outline';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ToggleComponent } from '../../../../shared/components/toggle/toggle.component';
import BaseForm from '../../../../shared/classes/base-form';
import { Supplier } from '../../../../shared/interfaces/supplier';
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { REGUX_AFL } from '../../../../shared/constants/reguex';
import { URL_SUPPLIERS } from '../../../../shared/constants/endpoints';

@Component({
  selector: 'app-supplier-forms',
  standalone: true,
  imports: [HeaderComponent, NgIconComponent, InputComponent, ToggleComponent],
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.scss',
  viewProviders: [provideIcons({ matArrowBackOutline })]
})
export default class SupplierFormComponent extends BaseForm implements OnInit {

  form: FormGroup;
  supplier: Supplier;

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private bpo: BreakpointObserver
  ) {
    super(crud, toast, auth, bpo);
    this.mode = this.setMode(this.route.snapshot.paramMap.get('mode'));
    if (this.mode !== 'new') this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.crud.baseUrl = URL_SUPPLIERS;
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.pattern(REGUX_AFL)]),
      supplierDesc: new FormControl('', [Validators.required]),
       email: new FormControl('', [Validators.required, Validators.email]),
           phone: new FormControl('', [Validators.required]),
          address: new FormControl('', [Validators.required]),
      active: new FormControl(true)
    });

    if (this.mode === 'edit') {
      this.load = true;
      firstValueFrom(this.crud.getId(this.id))
        .then((supplier: Supplier) => {
          this.form.controls['name'].setValue(supplier.supplierName);
          this.form.controls['supplierDesc'].setValue(supplier.supplierDesc);
          this.form.controls['email'].setValue(supplier.email);
          this.form.controls['phone'].setValue(supplier.phone);
          this.form.controls['address'].setValue(supplier.address);
          this.form.controls['active'].setValue(supplier.active);
        })
        .catch((error: any) => {
          console.log('error id: ', error);
        })
        .finally(() => {
          this.load = false;
        });
    }
  }

  ngOnInit(): void { }

  isDirty(): boolean {
    return this.form.dirty;
  }

  back() {
    this.router.navigate(['dashboard/suppliers']);
  }

  changeSupplierActive($event) {
    const value: boolean = $event.target.checked;
  }

  async submit() {
    this.load = true;
    this.isSaving = true;
    const supplier: Supplier = {
      id: (this.id) ? this.id : null,
      supplierName: this.form.controls['name'].value,
      supplierDesc: this.form.controls['supplierDesc'].value,
       email: this.form.controls['email'].value,
      phone: this.form.controls['phone'].value,
      address: this.form.controls['address'].value,
      active: this.form.controls['active'].value
    }

    if (this.mode === 'edit') {
      await firstValueFrom(this.crud.updateId(this.id, supplier))
        .then((response: any) => {
          this.toast.success(response.message);
          this.load = false;
        })
        .catch((error: any) => {
          this.toast.error(error.message);
          this.load = false;
        })
        .finally(() => {
          this.load = false;
          this.router.navigate(['dashboard/suppliers']);
        });
    } else if (this.mode === 'new') {
      await firstValueFrom(this.crud.save(supplier))
        .then((response: any) => {
          this.load = false;
          this.toast.success(response.message);
        })
        .catch((error: any) => {
          this.load = false;
          this.toast.error(error.message);
        })
        .finally(() => {
          this.load = false;
          this.router.navigate(['dashboard/suppliers']);
        });
    } else {
      this.toast.info('Estas en modo vista');
      this.router.navigate(['dashboard/suppliers']);
    }
  }
}
