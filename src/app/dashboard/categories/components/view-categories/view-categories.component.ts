import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-view-categories',
  templateUrl: './view-categories.component.html',
  styleUrls: ['./view-categories.component.scss'],
})
export class ViewCategoriesComponent  implements OnInit {
  categories: any[] = [];
  title: string = 'Ver categorías';

  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    // Llama a la función getCategorieDocuments 
    this.dashboardService.getCategorieDocuments('categories').subscribe((data) => {
      this.categories = data;
    });
  }

  editCategory(category: any) {
    this.navCtrl.navigateForward('/edit-category', { state: { category } });
  }
}
