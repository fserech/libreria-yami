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

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private dashboardService: DashboardService,
  ) {
    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required], // Cambia "categoryName" a "name"
      description: ['', Validators.required],
    });
  }

   
  ngOnInit() {}

  submit(){
    this.load = true;
    console.log("Guardando categoria")
    this.category = {
      name: this.categoryForm.controls['name'].value,
      description: this.categoryForm.controls['description'].value
    }
    this.dashboardService.saveDocument(CATEGORIES_COLLECTION_NAME,this.category)
      .then(( res: any ) => {
        console.log(res)
        this.categoryForm.reset();
        this.load = false;
      })
      .catch(( error: any ) => {
        console.log(error)
        this.categoryForm.reset();
        this.load = false;
      });
  }


}

