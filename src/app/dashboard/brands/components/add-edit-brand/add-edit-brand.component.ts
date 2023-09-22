import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BRANDS_COLLECTION_NAME, CATEGORIES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { REGEX_TEXT_WITHOUT_SPACES } from 'src/app/shared/constants/reguex';
import { Brand } from 'src/app/shared/models/brand';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';

@Component({
  selector: 'app-add-edit-brand',
  templateUrl: './add-edit-brand.component.html',
  styleUrls: ['./add-edit-brand.component.scss'],
})
export class AddEditBrandComponent implements OnInit {
  title: string = 'Nueva Marca';
  brandForm: FormGroup;
  load: boolean = false;
  brand: Brand;
  copied: boolean = false;
  valuesFirestore: string[] = [];
  keywords: string[] = [];
  record: Brand = null;
  mode: string = 'view';
 

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    const uid = this.route.snapshot.params['uid'];
    this.mode = this.route.snapshot.params['mode'];
    this.getFiles();
    if (uid && this.mode !== 'new') {
      this.load = true;
      this.title = this.mode === 'view' ? 'Visualizar Marca' : 'Editar Marca';
      this.dashboardService.getDocumentByIdToPromise(BRANDS_COLLECTION_NAME, uid)
        .then((response: Brand) => {
          this.record = response;
          this.brandForm.controls['name'].setValue(this.record.name);
          this.brandForm.controls['description'].setValue(this.record.description);
          this.load = false;
        })
        .catch((error: any) => {
          console.log(error);
          this.load = false;
        });
    }
  }

  ngOnInit() {}

  getFiles() {
    this.brandForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      
    });
  }

  submit() {
    this.load = true;
    this.record = {
      name: this.brandForm.controls['name'].value.toLowerCase(),
      description: this.brandForm.controls['description'].value,
      
    };
    if (this.mode == 'new') {
      this.dashboardService
        .saveDocument(BRANDS_COLLECTION_NAME, this.record)
        .then((response: any) => {
          this.reset();
        })
        .catch((error: any) => {
          console.log(error);
          this.reset();
        });
    } else {
      const uid = this.route.snapshot.params['uid'];
      this.dashboardService
        .udpateDocument(uid, BRANDS_COLLECTION_NAME, this.record)
        .then((response: any) => {
          this.reset('/dashboard/brands/all');
        })
        .catch((error: any) => {
          console.log(error);
          this.reset('/dashboard/brands/all');
        });
    }
  }

  reset(route?: string) {
    this.brandForm.reset();
    this.load = false;
    if (route) {
      this.router.navigate([route]);
    } else {
      this.router.navigate(['/dashboard/brands']);
    }
  }

  copyToClipboard(text: string | undefined) {
    if (text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999); // Para navegadores móviles
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.copied = true;
      this.toastService.success('Se copió el UID del registro');
      setTimeout(() => {
        this.copied = false;
      }, 1000); // Puedes ajustar el tiempo en milisegundos según tus preferencias
    }
  }
}
