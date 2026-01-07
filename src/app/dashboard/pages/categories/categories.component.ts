import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { matArrowBackOutline } from '@ng-icons/material-icons/outline';
import CategoriesGridMainComponent from './categories-grid-main/categories-grid-main.component';
import BrandsGridMainComponent from './brands/brands-grid-main/brands-grid-main.component';
import { RouterOutlet,Router, RouterLink  } from "@angular/router";


@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [HeaderComponent, NgIconComponent, InputComponent, ToggleComponent, CategoriesGridMainComponent, BrandsGridMainComponent, RouterOutlet, RouterLink   ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  viewProviders: [provideIcons({matArrowBackOutline})],
})
export default class CategoriesComponent implements OnInit{

   constructor(private router: Router) {}
ngOnInit() {
  this.router.events.subscribe(() => {
    if (this.router.url.includes('/brands')) {
      this.activeTab = 'brands';
    } else {
      this.activeTab = 'categories';
    }
  });
}

  activeTab: 'categories' | 'brands' = 'categories';

  setActiveTab(tab: 'categories' | 'brands') {
    this.activeTab = tab;
  }
}
