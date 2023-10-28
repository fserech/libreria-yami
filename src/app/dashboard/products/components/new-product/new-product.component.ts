import { Component, OnInit } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CATEGORIES_COLLECTION_NAME, PRODUCTS_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { MEASUREMENT_UNITS, WHOLESALE_MEASUREMENT_UNITS } from 'src/app/shared/constants/measurement-units';
import { REGEX_TEX, REGUEX_NUMBERS_FLOAT } from 'src/app/shared/constants/reguex';
import { Category } from 'src/app/shared/models/category';
import { Product } from 'src/app/shared/models/product';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';
import { MESSAGES_APP } from 'src/app/shared/constants/messages-app'

@Component({
  selector: 'app-new-product',
  templateUrl: './new-product.component.html',
  styleUrls: ['./new-product.component.scss'],
})
export class NewProductComponent  implements OnInit {

  title: string = 'Nuevo Producto';
  form: FormGroup;
  load: boolean = false;
  copied: boolean = false;
  record: Product = null;
  recordAux: Product = null;
  categoryRef: Category = null;
  mode: string = 'view';
  routeBack: string = '/dashboard/products';
  routeBackAll: string = '/dashboard/products/all';
  measurement_units: any[] = MEASUREMENT_UNITS;
  wholesale_measurement_units: any[] = WHOLESALE_MEASUREMENT_UNITS;
  regexNumberFloat: RegExp = REGUEX_NUMBERS_FLOAT;
  regexText: RegExp = REGEX_TEX;

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
        this.title = (this.mode === 'view') ? 'Visualizar Producto' : 'Editar Producto';
        this.dashboardService.getDocumentByIdToPromise(PRODUCTS_COLLECTION_NAME, uid)
        .then((record: Product) => {
          this.record = record;
          this.recordAux = record;
          this.dashboardService.getDataDocumentReference(this.record.categoryRef)
              .then((response: Category) => {

                this.categoryRef = response;

                this.form.controls['name'].setValue(this.record.name);
                this.form.controls['description'].setValue(this.record.description);
                this.form.controls['category'].setValue(this.categoryRef.uid);
                this.form.controls['brands'].setValue(this.record.brandsRef);
                this.form.controls['stock'].setValue(this.record.stock === '0' ? 'Sin stock disponible' : this.record.stock);
                this.form.controls['unitMeasurement'].setValue(this.record.unitMeasurement);
                this.form.controls['typeWholesaleUnitMeasure'].setValue(this.record.typeWholesaleUnitMeasure);
                this.form.controls['priceSale'].setValue(this.record.priceSale);
                this.form.controls['active'].setValue(this.record.active);
                this.form.controls['unitsPackage'].setValue(this.record.unitsPackage);
                this.form.controls['stockMin'].setValue(this.record.stockMin);
                this.form.controls['stockMax'].setValue(this.record.stockMax);

                this.form.controls['priceSale'].disable();
                this.form.controls['stock'].disable();
                this.load = false;

              })
              .catch((error: any) => {
                this.load = false;
              });
        })
        .catch((error: any) => {
          this.load = false;
        });
      }
    }

  ngOnInit() {}

  getFiles(){
    this.form = this.fb.group({
      name: ['' , [Validators.required, Validators.pattern(this.regexText)]],
      description: ['' , [Validators.required, Validators.pattern(this.regexText)]],
      category: ['' , Validators.required],
      brands: ['' , Validators.required],
      stock: { value: 'sin stock' , disabled: true},
      stockMin: [null ,[Validators.required, Validators.pattern(this.regexNumberFloat)]],
      stockMax: [null ,[Validators.required, Validators.pattern(this.regexNumberFloat)]],
      unitMeasurement: ['' , Validators.required],
      typeWholesaleUnitMeasure: ['' , Validators.required],
      priceSale: ['El precio del producto se calcula antes de cargar a Stock' , [Validators.required, Validators.pattern(this.regexNumberFloat)]],
      active: [false , Validators.required],
      unitsPackage: ['' , [Validators.required, Validators.pattern(this.regexNumberFloat)]]
    });
    if(this.mode === 'new' || this.mode === 'view'){
      this.form.controls['priceSale'].disable();
      this.form.controls['stock'].disable();
    }
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

  submit() {
    this.load = true;
    const newname = this.form.controls['name'].value;
    this.dashboardService.searchForField(PRODUCTS_COLLECTION_NAME, 'name', newname)
      .subscribe((result: any[]) => {
        if (result.length > 0) {
          this.toastService.info(' No se puede crear otro producto con el mismo nombre.');
          this.load = false;
        } else {
          const date: Date = new Date();
          this.record = {
            name: newname,
            description: this.form.controls['description'].value,
            brandsRef: this.form.controls['brands'].value,
            categoryRef: this.dashboardService.getDocumentReference(CATEGORIES_COLLECTION_NAME, this.form.controls['category'].value),
            stock: this.mode === 'new' ? '0' : this.recordAux.stock,
            unitMeasurement: this.form.controls['unitMeasurement'].value,
            typeWholesaleUnitMeasure: this.form.controls['typeWholesaleUnitMeasure'].value,
            priceSale: this.mode === 'new' ? '00.00' : this.recordAux.priceSale,
            unitsPackage: this.form.controls['unitsPackage'].value,
            active: this.form.controls['active'].value,
            stockMin: this.form.controls['stockMin'].value,
            stockMax: this.form.controls['stockMax'].value,
            createAt: this.mode === 'new' ? date : this.recordAux.createAt,
            isSelected: this.form.controls['active'].value,
          };
          if (this.mode == 'new') {
            this.dashboardService
              .saveDocument(PRODUCTS_COLLECTION_NAME, this.record)
              .then((response: any) => {
                this.reset();
                this.toastService.success('Producto creado exitosamente.');
              })
              .catch((error: any) => {
                console.log(error);
                this.reset();
                this.toastService.error('Hubo un error al crear el producto.');
              });
          } else if (this.mode === 'edit') {
            const uid = this.route.snapshot.params['uid'];
            this.dashboardService
              .udpateDocument(uid, PRODUCTS_COLLECTION_NAME, this.record)
              .then((response: any) => {
                this.toastService.success('Producto actualizado exitosamente.');
                this.reset(this.routeBackAll);
              })
              .catch((error: any) => {
                this.reset(this.routeBackAll);
              });
          }
        }
      });
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

  getTypeWholesaleUnitMeasure(value: string):string{
    return this.wholesale_measurement_units.find((element: any) => value === element.value).label;
  }

  getUnitMeasure(value: string):string{
    if(value === 'U'){
      return this.measurement_units.find((element: any) => value === element.value).label + 'es';
    }else{
      return this.measurement_units.find((element: any) => value === element.value).label + 's';
    }
  }

  getMessageApp(code: string): string{
    return MESSAGES_APP.find((element: any) => element.code === code).message;
  }

  validateStockMinMax() {
    const stockMaxControl = this.form.get('stockMax');
    const stockMinControl = this.form.get('stockMin');

    if (stockMaxControl.value && stockMinControl.value) {
      const stockMax = parseFloat(stockMaxControl.value);
      const stockMin = parseFloat(stockMinControl.value);

      if (stockMax <= stockMin) {
        stockMaxControl.setErrors({ 'stockMaxLessThanMin': true });
        stockMinControl.setErrors({ 'stockMinGreaterThanMax': true });
      } else {
        stockMaxControl.setErrors(null);
        stockMinControl.setErrors(null);
      }
    }
  }
}
