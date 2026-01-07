import { NgFor, NgTemplateOutlet, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { SubMenuItem } from '../../../../interfaces/menu.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matAddShoppingCartOutline, matAltRouteOutline, matAnimationOutline, matArrowForwardIosOutline, matCategoryOutline, matGroupOutline, matGroupsOutline, matHomeOutline,
         matInsertDriveFileOutline, matInventory2Outline, matLocalShippingOutline, matLoyaltyOutline, matProductionQuantityLimitsOutline, matReceiptOutline,
         matShoppingBagOutline,
         matTodayOutline } from '@ng-icons/material-icons/outline';

@Component({
  selector: 'div[navbar-submenu]',
  standalone: true,
  imports: [
    NgFor,
        NgTemplateOutlet,
        RouterLinkActive,
        RouterLink,
        NgIf,
        NgIconComponent
  ],
  templateUrl: './navbar-submenu.component.html',
  styleUrl: './navbar-submenu.component.scss',
  viewProviders:[
    provideIcons({
      matHomeOutline,
      matGroupOutline,
      matGroupsOutline,
      matLoyaltyOutline,
      matLocalShippingOutline,
      matInsertDriveFileOutline,
      matReceiptOutline,
      matTodayOutline,
      matArrowForwardIosOutline,
      matInventory2Outline,
    matProductionQuantityLimitsOutline ,
    matAddShoppingCartOutline,
    matCategoryOutline,
    matAnimationOutline,
    matAltRouteOutline,
    matShoppingBagOutline
    })
  ]
})
export class NavbarSubmenuComponent {

  @Input() public submenu = <SubMenuItem[]>{};

  constructor() {}

  ngOnInit(): void {}
}
