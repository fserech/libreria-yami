import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ARTICLES_COLLECTION_NAME, CATEGORIES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { Article } from 'src/app/shared/models/article';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';

@Component({
  selector: 'app-new-article',
  templateUrl: './new-article.component.html',
  styleUrls: ['./new-article.component.scss'],
})
export class NewArticleComponent implements OnInit {
  title: string = 'Nuevo Articulo';
  articleForm: FormGroup;
  load: boolean = false;
  article: Article;
  valuesFirestore: string[] = [];
  keywords: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private dashboardService: DashboardService,
  ) {
    this.articleForm = this.formBuilder.group({
      name: ['', Validators.required],
      mark: ['', Validators.required],
      categoryRef: ['', Validators.required],
      keywords: [''],
    });
  }

  ngOnInit() {}

  chipsEvent(keywords: string[]) {
    this.keywords = keywords;
  }

  submit() {
    this.load = true;
    this.article = {
      name: this.articleForm.controls['name'].value,
      mark: this.articleForm.controls['mark'].value,
      categoryRef: this.dashboardService.getDocumentReference(CATEGORIES_COLLECTION_NAME, this.articleForm.controls['categoryRef'].value),
      keywords: this.keywords,
    };

    this.dashboardService.saveDocument(ARTICLES_COLLECTION_NAME, this.article)
      .then((res: any) => {
        console.log(res);
        this.articleForm.reset();
        this.keywords = [];
        this.load = false;
      })
      .catch((error: any) => {
        console.log(error);
        this.articleForm.reset();
        this.keywords = [];
        this.load = false;
      });
  }
}
