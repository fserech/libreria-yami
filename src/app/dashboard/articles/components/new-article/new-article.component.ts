import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ARTICLES_COLLECTION_NAME, CATEGORIES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { REGEX_TEXT_WITHOUT_SPACES } from 'src/app/shared/constants/reguex';
import { Article } from 'src/app/shared/models/article';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';

@Component({
  selector: 'app-new-article',
  templateUrl: './new-article.component.html',
  styleUrls: ['./new-article.component.scss'],
})
export class NewArticleComponent implements OnInit {
  title: string = 'Nuevo Insumo';
  articleForm: FormGroup;
  load: boolean = false;
  article: Article;
  copied: boolean = false;
  valuesFirestore: string[] = [];
  keywords: string[] = [];
  record: Article = null;
  mode: string = 'view';
  reguexText:RegExp = REGEX_TEXT_WITHOUT_SPACES;

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
      this.title = (this.mode === 'view') ? 'Visualizar Insumo' : 'Editar Insumo';
      this.dashboardService.getDocumentByIdToPromise(CATEGORIES_COLLECTION_NAME, uid)
      .then((response: Article) => {
        this.record = response;
        this.articleForm.controls['name'].setValue(this.record.name);
        this.articleForm.controls['description'].setValue(this.record.description);
        this.articleForm.controls['categoryRef'].setValue(this.record.categoryRef);
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

  ngOnInit() {}

  getFiles(){
    this.articleForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      categoryRef: ['', Validators.required],
      keywords: ['', Validators.pattern(this.reguexText)]
    });
  }

  chipsEvent(keywords: string[]) {
    this.keywords = keywords;
  }

  submit() {
    this.load = true;
     if(this.keywords.length > 0){
      this.keywords.push(this.articleForm.controls['name'].value.toLowerCase());

      this.record = {
        name: this.articleForm.controls['name'].value.toLowerCase(),
        description: this.articleForm.controls['description'].value,
        categoryRef: this.dashboardService.getDocumentReference(CATEGORIES_COLLECTION_NAME, this.articleForm.controls['categoryRef'].value),
        keywords: this.keywords
      }
      if(this.mode == 'new'){
        this.dashboardService
          .saveDocument(ARTICLES_COLLECTION_NAME,this.record)
          .then(( response: any ) => {
            this.reset();
          })
          .catch(( error: any ) => {
            console.log(error)
            this.reset();
          });
      }else{
        const uid = this.route.snapshot.params['uid'];
        this.dashboardService
          .udpateDocument(uid, ARTICLES_COLLECTION_NAME  , this.record)
          .then((response: any) => {
            this.reset('/dashboard/articles/all');
          })
          .catch((error: any) => {
            console.log(error);
            this.reset('/dashboard/articles/all');
          });
      }
    }

   
  }
  reset(route?: string){
    this.articleForm.reset();
    this.keywords = [];
    this.valuesFirestore = [];
    this.load = false;
    if(route){
      this.router.navigate([route]);
    }else{
      this.router.navigate(['/dashboard/articles']);
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
      this.toastService.success('se copio UID del registro');
      setTimeout(() => {
        this.copied = false;
      }, 1000); // Puedes ajustar el tiempo en milisegundos según tus preferencias

    }
  }
}
