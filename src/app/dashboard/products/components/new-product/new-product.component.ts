import { Component, OnInit } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PRODUCTS_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { MEASUREMENT_UNITS, WHOLESALE_MEASUREMENT_UNITS_ } from 'src/app/shared/constants/measurement-units';
import { PackageInfo, Product } from 'src/app/shared/models/product';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';

@Component({
  selector: 'app-new-product',
  templateUrl: './new-product.component.html',
  styleUrls: ['./new-product.component.scss'],
})
export class NewProductComponent  implements OnInit {

  title: string = 'Nuevo Producto';
  form: FormGroup;
  formP: FormGroup;
  load: boolean = false;
  copied: boolean = false;
  record: Product = null;
  mode: string = 'view';
  routeBack: string = '/dashboard/products';
  routeBackAll: string = '/dashboard/products/all';
  measurement_units: any[] = MEASUREMENT_UNITS;
  wholesale_measurement_units: any[] = WHOLESALE_MEASUREMENT_UNITS_;

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router) {
      const uid = this.route.snapshot.params['uid'];
      this.mode = this.route.snapshot.params['mode'];
      this.getFiles();
      if(uid && this.mode !== 'new'){
        this.load = true;
        this.title = (this.mode === 'view') ? 'Visualizar Categoria' : 'Editar Categoria';
        this.dashboardService.getDocumentByIdToPromise(PRODUCTS_COLLECTION_NAME, uid)
        .then((record: Product) => {
          this.record = record;
          this.form.controls['name'].setValue(this.record.name);
          this.form.controls['description'].setValue(this.record.description);
          this.load = false;
        })
        .catch((error: any) => {
          console.log(error);
          this.load = false;
        });
      }
    }

  ngOnInit() {}

  getFiles(){
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      brand: ['', Validators.required],
      stock: { value: 0, disabled: true},
      unitMeasurement: ['', Validators.required],
      priceSale: ['', Validators.required],
      package: [false, Validators.required],
    });
    this.formP = this.fb.group({
      price: ['', Validators.required],
      unitPrice: ['', Validators.required],
      units: ['', Validators.required]
    });
  }

  reset(route?: string){
    this.form.reset();
    this.load = false;
    if(route){
      this.router.navigate([route]);
    }else{
      this.router.navigate([this.routeBack]);
    }
  }

  submit(){
    this.load = true;

    this.record = {
      name: this.form.controls['name'].value,
      description: this.form.controls['description'].value,
      brandsRef: this.getListBrands(),
      categoryRef: this.dashboardService.getDocumentReference(PRODUCTS_COLLECTION_NAME,''),
      stock: this.form.controls['0'].value,
      unitMeasurement: this.form.controls['unitMeasurement'].value,
      priceSale: this.form.controls['priceSale'].value,
      // package?: PackageInfo;
    }

    if(this.mode == 'new'){
      this.dashboardService
          .saveDocument(PRODUCTS_COLLECTION_NAME,this.record)
          .then(( response: any ) => { this.reset(); })
          .catch(( error: any ) => { this.reset(); });
    }else if(this.mode === 'edit'){
      const uid = this.route.snapshot.params['uid'];
      this.dashboardService
        .udpateDocument(uid, PRODUCTS_COLLECTION_NAME, this.record)
        .then((response: any) => {
          this.reset(this.routeBackAll);
        })
        .catch((error: any) => {
          console.log(error);
          this.reset(this.routeBackAll);
        });
    }
  }

  getInfoPackage(): PackageInfo{
    return null;
  }

  getListBrands(): DocumentReference[]{
    return null
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
      this.toastService.success('se copio UID del registro');
      setTimeout(() => {
        this.copied = false;
      }, 1000); // Puedes ajustar el tiempo en milisegundos según tus preferencias

    }
  }


}
