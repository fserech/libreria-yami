import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { BRANDS_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { Article } from 'src/app/shared/models/article';
import { Brand } from 'src/app/shared/models/brand';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';

@Component({
  selector: 'app-view-all-brand',
  templateUrl: './view-all-brand.component.html',
  styleUrls: ['./view-all-brand.component.scss'],
})
export class ViewAllBrandComponent implements OnInit {
  brands: Brand[] = [];
  title: string = 'Ver marcas';
  selectedArticles: Article[] = []; // Lista de artículos seleccionados
  fruits: Article[] = []; // Lista de todos los artículos disponibles
  selectedFruitsText: string = '';

  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    // Llama a la función para obtener todas las marcas
    this.dashboardService.getAllItemsCollection(BRANDS_COLLECTION_NAME, 'name')
      .subscribe({
        next: (brands: Brand[]) => {
          console.log('brands: ', brands);
          this.brands = brands;
        },
        error: error => {
          console.log(error);
        }
      });

  }

  editBrand(brand: Brand) {
    // Navega a la página de edición de marca y pasa el ID de la marca como parte de la URL
    this.navCtrl.navigateForward(`/dashboard/brands/edit/${brand.uid}`);
  }

  deleteBrand(brand: Brand) {
    // Aquí puedes implementar la lógica para eliminar una marca
    // Por ejemplo, mostrar un diálogo de confirmación y realizar la eliminación si el usuario confirma
  }

  handleInput(event: any) {
    const value = event.target.value.toLowerCase();
    this.dashboardService.searchForField(BRANDS_COLLECTION_NAME, 'name', value)
    .subscribe(
      (response: any[]) => {
        this.brands = response;
      },
      (error: any) => {
        console.log(error);
      }
      // {
      //     next: (response: Brand[]) => {
      //       this.brands = response;
      //     },
      //     error: (error: any) => {
      //       console.log(error);
      //     }
      //   }
        );
  }

  firstCapitalLetter(cadena: string): string {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
  }
}
