import { Component } from '@angular/core';
import { MenuService } from '../../../../services/menu.service';
import { SubMenuItem } from '../../../../interfaces/menu.model';
import { NgFor, NgClass, NgTemplateOutlet, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarSubmenuComponent } from '../sidebar-submenu/sidebar-submenu.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {  matAddShoppingCartOutline, matAltRouteOutline, matAnimationOutline, matCategoryOutline, matFilterBAndWOutline, matGroupOutline, matGroupsOutline, matHomeOutline, matInsertDriveFileOutline, matInventory2Outline, matLocalOfferOutline, matLocalShippingOutline, matLoyaltyOutline, matProductionQuantityLimitsOutline, matReceiptOutline, matShoppingBagOutline, matShoppingCartOutline, matStorefrontOutline, matTodayOutline, matViewInArOutline, matWarehouseOutline } from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [
    NgFor,
        NgClass,
        // AngularSvgIconModule,
        NgTemplateOutlet,
        RouterLink,
        RouterLinkActive,
        NgIf,
        SidebarSubmenuComponent,
        NgIconComponent,

  ],
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.scss',
  viewProviders: [provideIcons({
    matHomeOutline,
    matGroupOutline,
    matGroupsOutline,
    matLoyaltyOutline,
    matLocalShippingOutline,
    matInsertDriveFileOutline,
    matTodayOutline,
    matReceiptOutline,
    matInventory2Outline,
    matProductionQuantityLimitsOutline ,
    matAddShoppingCartOutline,
    matCategoryOutline,
    matAnimationOutline,
    matAltRouteOutline,
    matShoppingBagOutline
     })]
})
export class SidebarMenuComponent {

  constructor(public menuService: MenuService) {}

  ngOnInit(): void {
    this.menuService.setPermissions();
  }

  public toggleMenu(subMenu: SubMenuItem) {
    this.menuService.toggleMenu(subMenu);
  }

}
