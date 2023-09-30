import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PRODUCTS_COLLECTION_NAME, SALES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { MEASUREMENT_UNITS, WHOLESALE_MEASUREMENT_UNITS } from 'src/app/shared/constants/measurement-units';
import { MESSAGES_APP } from 'src/app/shared/constants/messages-app';
import { REGEX_TEX, REGUEX_NUMBERS_FLOAT } from 'src/app/shared/constants/reguex';
import { Product } from 'src/app/shared/models/product';
import { Sale } from 'src/app/shared/models/sale';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';

@Component({
  selector: 'app-new-sale',
  templateUrl: './new-sale.component.html',
  styleUrls: ['./new-sale.component.scss'],
})
export class NewSaleComponent  implements OnInit {
  title: string = 'Nueva Venta';
  form: FormGroup;
  load: boolean = false;
  copied: boolean = false;
  record: Sale = null; 
  recordAux: Sale = null;
  productRef: Product = null;
  products: Product[] = [];
  mode: string = 'view';
  searchTerm: string = '';
  routeBack: string = '/dashboard/sales';
  routeBackAll: string = '/dashboard/sales/all';
  measurement_units: any[] = MEASUREMENT_UNITS;
  wholesale_measurement_units: any[] = WHOLESALE_MEASUREMENT_UNITS;
  regexNumberFloat: RegExp = REGUEX_NUMBERS_FLOAT;
  regexText: RegExp = REGEX_TEX;
  keywords: string[] = [];
  valuesFirestore: string[] = [];
  isChecked: boolean = false;
  selectedProducts: any []=[];
  totalPrice: number = 0;
 
 

  

  constructor(
    //importacion de servicio a utilizar
    private fb: FormBuilder,
    private toastService: ToastService,
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController
  ) { 

   
    const uid= this.route.snapshot.params['uid'];
    this.mode = this.route.snapshot.params['mode'];
   
    
    this.getFiles();
    if (uid && this.mode !== 'new') {
      this.load = true;
      this.title = (this.mode === 'view') ? 'Visualizar Venta' : 'Editar Ventas';
      this.dashboardService.getDocumentByIdToPromise(SALES_COLLECTION_NAME, uid)
      .then((response: Sale) => {
        this.record = response;
        this.recordAux = response;
        this.dashboardService.getDataDocumentReference(this.record.productRef)
        .then((response: Product)=>{
          this.productRef = response;

          // Configura los valores en tu formulario (ajusta esto según tus campos y formulario)
          this.form.controls['name'].setValue(this.record.name);
          this.form.controls['description'].setValue(this.record.description);
          this.form.controls['quantity'].setValue(this.record.quantity);
          this.form.controls['total'].setValue(this.record.totalPrice);
          this.form.controls['stock'].setValue(this.record.stock === '0' ? 'Sin stock disponible' : this.record.stock);
          this.form.controls['unitMeasurement'].setValue(this.record.unitMeasurement);
          this.form.controls['typeWholesaleUnitMeasure'].setValue(this.record.typeWholesaleUnitMeasure);
          this.form.controls['priceSale'].setValue(this.record.priceSale);
          this.form.controls['active'].setValue(this.record.active);
          this.form.controls['unitsPackage'].setValue(this.record.unitsPackage);
          this.form.controls['stockMin'].setValue(this.record.stockMin);
          this.form.controls['stockMax'].setValue(this.record.stockMax);
          this.form.controls['active'].setValue(this.record.active);

          // Desactiva los controles si es necesario
          this.form.controls['priceSale'].disable();
          this.form.controls['stock'].disable();
          this.load = false;
          const indexToRemove = this.record.keywords.indexOf(this.record.name.toLowerCase());
        if (indexToRemove !== -1) {
          this.record.keywords.splice(indexToRemove, 1);
        }
        this.valuesFirestore = this.record.keywords;
        this.load = false;
        })
        .catch((error: any) => {
          console.log(error);
          this.load = false;
        });
      })
      .catch((error: any) => {
        console.log(error);
        this.load = false;
      });
    }
  }

  
  ngOnInit() {
    
    this.dashboardService.getAllItemsCollection(PRODUCTS_COLLECTION_NAME,
       'name'||'description'||'priceSale'||'stock'||'active')
    .subscribe({
      next: (products: Product[]) => {
        this.products = products; 
        
      },
      error: error => {console.log(error);}
    });
  }

  getFiles() {
    
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      description: ['' , [Validators.required, Validators.pattern(this.regexText)]],
      stock: { value: 'sin stock' , disabled: true},
      // stockMin: [null ,[Validators.required, Validators.pattern(this.regexNumberFloat)]],
      // stockMax: [null ,[Validators.required, Validators.pattern(this.regexNumberFloat)]],
      unitMeasurement: ['' , Validators.required],
      typeWholesaleUnitMeasure: ['' , Validators.required],
      priceSale: ['El precio del producto se calcula antes de cargar a Stock' , [Validators.required, Validators.pattern(this.regexNumberFloat)]],
      quantity: ['cantidad de productos' , [Validators.required, Validators.pattern(this.regexNumberFloat)]],
      total: ['El precio de venta se calcula ' , [Validators.required, Validators.pattern(this.regexNumberFloat)]],
      active: [false , Validators.required],
      unitsPackage: ['' , [Validators.required, Validators.pattern(this.regexNumberFloat)]],
      nit: [false , Validators.required],
    });
  }

 




  // funcion bboton guardar
  submit(){
    this.load = true;
    const date: Date = new Date();
 

    this.record = {
      name: this.form.controls['name'].value.toLowerCase(),
      description: this.form.controls['description'].value,
      productRef: this.dashboardService.getDocumentReference(PRODUCTS_COLLECTION_NAME,this.form.controls['product'].value),
      stock: this.mode === 'new' ? '0' : this.recordAux.stock,
      unitMeasurement: this.form.controls['unitMeasurement'].value,
      typeWholesaleUnitMeasure: this.form.controls['typeWholesaleUnitMeasure'].value,
      priceSale: this.mode === 'new' ? '00.00' : this.recordAux.priceSale,
      quantity: this.form.controls['quantity'].value,
      totalPrice: this.mode === 'new' ? '00.00' : this.recordAux.priceSale,
      date: this.form.controls['date'].value,
      nit:  this.form.controls['active'].value,
      unitsPackage: this.form.controls['unitsPackage'].value,
      active: this.form.controls['active'].value,
      stockMin: this.form.controls['stockMin'].value,
      stockMax: this.form.controls['stockMax'].value,
      createAt: this.mode === 'new' ? date : this.recordAux.createAt,
      keywords: this.keywords,
      
    }
    if(this.mode == 'new'){
      this.dashboardService
          .saveDocument(SALES_COLLECTION_NAME,this.record)
          .then(( response: any ) => {
             this.reset(); })
          .catch(( error: any ) => {
             this.reset(); 
             console.log(error)
            });
    }else{
      (this.mode === 'edit')
      const uid = this.route.snapshot.params['uid'];
      this.dashboardService
        .udpateDocument(uid, SALES_COLLECTION_NAME, this.record)
        .then((response: any) => {
          this.reset('/dashboard/sales/all');
        })
        .catch((error: any) => {
          this.reset('/dashboard/sales/all');
        });
    }

  }

  reset(route?: string){
    this.form.reset();
    this.keywords = [];
    this.valuesFirestore = [];
    this.load = false;
    if(route){
      this.router.navigate([route]);
    }else{
      this.router.navigate(['/dashboard/sales']);
    }

  }

 
  // copyToClipboard
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


  
  // Función para filtrar los productos en función del término de búsqueda
  handleInput(event: any){
    const query = event.target.value.toLowerCase();
    if (query === '') {
      // Si la consulta está vacía, no se muestran productos
      this.products = [];
    }else{

    this.dashboardService.searchByArrayString(PRODUCTS_COLLECTION_NAME, 'name', query, 'name')
      .subscribe(
        (response: any[]) => {
          console.log(response);
          this.products = response;
        },
        (error: any) => {
          console.log(error);
        }
      //   {
      //   next: (response: Category[]) => {
      //     this.categories = response;
      //     console.log(response);
      //   },
      //   error: (error: any) => {
      //     console.log(error);
      //   }
      // }
      );
    }
  }

  firstCapitalLetter(cadena: string): string {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
  }

  toggleProduct(product: any) {
    // Alternar el estado isSelected del producto
    product.isSelected = !product.isSelected;
  
    // Verificar si el producto está seleccionado o deseleccionado
    if (product.isSelected) {
      // Agregar el producto a la lista de productos seleccionados si está seleccionado
      this.selectedProducts.push(product);
    } else {
      // Eliminar el producto de la lista de productos seleccionados si está deseleccionado
      const index = this.selectedProducts.indexOf(product);
      if (index !== -1) {
        this.selectedProducts.splice(index, 1);
      }
    }
  

  }
  
  addToSellList() {
    // Agregar los productos seleccionados a la lista de productos para vender
    for (const product of this.selectedProducts) {
      this.addToSellListIndividual(product);
    }
  
    this.selectedProducts = [];
  
    // Recalcular el precio total después de agregar productos
    this.calculateTotalPrice();
  }
  
  addToSellListIndividual(product: any) {
   
    console.log('Producto agregado a la lista de productos para vender:', product);
  }
  
  removeFromSellList(product: any) {
    
    console.log('Producto eliminado de la lista de productos para vender:', product);
  
    // Recalcular el precio total después de eliminar productos
    this.calculateTotalPrice();
  }
  

  calculateTotalPrice() { 
    this.totalPrice = 0;

    // Sumar los totales de todos los productos seleccionados
    for (const product of this.selectedProducts) {
      this.totalPrice += product.quantity * product.priceSale;
    }
  }

  calculateTotal(product: any): number {
    console.log('quantity:', product.quantity);
    console.log('priceSale:', product.priceSale);
    return product.quantity * product.priceSale;
  }
  
 
  
}
  


