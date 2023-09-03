import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  category: Category;
  valuesFirestore: string[] = [];
  keywords: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private dashboardService: DashboardService,
  ) {
    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required], // Cambia "categoryName" a "name"
      description: ['', Validators.required],
      keywords: ['']
    });
  }

  ngOnInit() {}

  chipsEvent(keywords: string[]){
    this.keywords =  keywords;
  }

  submit(){
    this.load = true;
    if(this.keywords.length > 0){

      this.keywords.push(this.categoryForm.controls['name'].value.toLowerCase())

      this.category = {
        name: this.categoryForm.controls['name'].value.toLowerCase(),
        description: this.categoryForm.controls['description'].value,
        keywords: this.keywords
      }
      this.dashboardService.saveDocument(CATEGORIES_COLLECTION_NAME,this.category)
        .then(( res: any ) => {
          console.log(res)
          this.categoryForm.reset();
          this.keywords = [];
          this.load = false;
        })
        .catch(( error: any ) => {
          console.log(error)
          this.categoryForm.reset();
          this.keywords = [];
          this.load = false;
        });
    }
  }
}

