import { NgFor, NgClass, NgTemplateOutlet, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SubMenuItem } from '../../../../../interfaces/menu.model';
import { MenuService } from '../../../../../services/menu.service';
import { NavbarMobileSubmenuComponent } from '../navbar-mobile-submenu/navbar-mobile-submenu.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matAddShoppingCartOutline, matAltRouteOutline, matAnimationOutline, matArrowForwardIosOutline, matCategoryOutline, matGroupOutline, matGroupsOutline, matHomeOutline, matInsertDriveFileOutline, matInventory2Outline, matLocalShippingOutline, matLoyaltyOutline, matProductionQuantityLimitsOutline, matReceiptOutline, matTodayOutline } from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-navbar-mobile-menu',
  standalone: true,
  imports: [
    NgFor,
    NgClass,
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    NgIf,
    NavbarMobileSubmenuComponent,
    NgIconComponent],
  templateUrl: './navbar-mobile-menu.component.html',
  styleUrl: './navbar-mobile-menu.component.scss',
  viewProviders: [provideIcons({
    matHomeOutline,
    matGroupOutline,
    matGroupsOutline,
    matLoyaltyOutline,
    matLocalShippingOutline,
    matInsertDriveFileOutline,
    matTodayOutline,
    matReceiptOutline,
    matArrowForwardIosOutline,
    matInventory2Outline,
    matProductionQuantityLimitsOutline ,
    matAddShoppingCartOutline,
    matCategoryOutline,
    matAnimationOutline,
    matAltRouteOutline
     })]
})
export class NavbarMobileMenuComponent implements OnInit, OnDestroy {

  constructor(public menuService: MenuService) {}

  ngOnDestroy(): void {
  }

  public toggleMenu(subMenu: SubMenuItem) {
    this.menuService.toggleMenu(subMenu);
    this.closeMenu();
  }

  public closeMenu() {
    this.menuService.showMobileMenu = false;
  }

  ngOnInit(): void {}
}
