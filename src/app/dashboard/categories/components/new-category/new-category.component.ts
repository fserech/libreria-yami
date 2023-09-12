import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CATEGORIES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { Category } from 'src/app/shared/models/category';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';

@Component({
  selector: 'app-new-category',
  templateUrl: './new-category.component.html',
  styleUrls: ['./new-category.component.scss'],
})
export class NewCategoryComponent implements OnInit {
  title: string = 'Nueva Categoria';
  categoryForm: FormGroup;
  load: boolean = false;
  copied: boolean = false;
  valuesFirestore: string[] = [];
  keywords: string[] = [];
  record: Category = null;
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
    if(uid && this.mode !== 'new'){
      this.load = true;
      this.title = (this.mode === 'view') ? 'Visualizar Categoria' : 'Editar Categoria';
      this.dashboardService.getDocumentByIdToPromise(CATEGORIES_COLLECTION_NAME, uid)
      .then((response: Category) => {
        this.record = response;
        console.log(response);
        console.log(this.record);
        this.categoryForm.controls['name'].setValue(this.record.name);
        this.categoryForm.controls['description'].setValue(this.record.description);

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
    }
  }

  ngOnInit() {
  }

  getFiles(){
    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      keywords: ['']
    });
  }

  chipsEvent(keywords: string[]){
    this.keywords =  keywords;
  }

  submit(){
    this.load = true;
     if(this.keywords.length > 0){
      this.keywords.push(this.categoryForm.controls['name'].value.toLowerCase());

      this.record = {
        name: this.categoryForm.controls['name'].value.toLowerCase(),
        description: this.categoryForm.controls['description'].value,
        keywords: this.keywords
      }
      if(this.mode == 'new'){
        this.dashboardService
          .saveDocument(CATEGORIES_COLLECTION_NAME,this.record)
          .then(( response: any ) => {
            console.log(response);
            this.reset();
          })
          .catch(( error: any ) => {
            console.log(error)
            this.reset();
          });
      }else{
        const uid = this.route.snapshot.params['uid'];
        this.dashboardService
          .udpateDocument(uid, CATEGORIES_COLLECTION_NAME, this.record)
          .then((response: any) => {
            console.log(response);
            this.reset('/dashboard/categories/all');
          })
          .catch((error: any) => {
            console.log(error);
            this.reset('/dashboard/categories/all');
          });
      }
    }
  }

  reset(route?: string){
    this.categoryForm.reset();
    this.keywords = [];
    this.valuesFirestore = [];
    this.load = false;
    if(route){
      this.router.navigate([route]);
    }else{
      this.router.navigate(['/dashboard/categories']);
    }

  }

  copyToClipboard(text: string | undefined) {
    if (text) {
      // Crea un elemento de textarea oculto para copiar el texto al portapapeles
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      // Selecciona el texto en el textarea
      textArea.select();
      textArea.setSelectionRange(0, 99999); // Para navegadores móviles
      // Copia el texto al portapapeles
      document.execCommand('copy');
      // Elimina el textarea temporal
      document.body.removeChild(textArea);
      this.copied = true;

      // Opcional: Muestra una notificación o realiza otras acciones después de copiar
      this.toastService.success('se copio UID del registro');

      setTimeout(() => {
        this.copied = false;
      }, 1000); // Puedes ajustar el tiempo en milisegundos según tus preferencias

    }
  }

}

