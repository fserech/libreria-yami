import { Component, OnInit } from '@angular/core';
import { NavbarMobileMenuComponent } from './navbar-mobile-menu/navbar-mobile-menu.component';
import { NgClass } from '@angular/common';
import { MenuService } from '../../../../services/menu.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matCloseRound, matMenuRound } from '@ng-icons/material-icons/round';
@Component({
  selector: 'app-navbar-mobile',
  standalone: true,
  imports: [
    NgClass,
    NavbarMobileMenuComponent,
    NgIconComponent
  ],
  templateUrl: './navbar-mobile.component.html',
  styleUrl: './navbar-mobile.component.scss',
  viewProviders: [provideIcons({ matMenuRound, matCloseRound })]

})
export class NavbarMobileComponent implements OnInit {

  constructor(public menuService: MenuService) {}

  ngOnInit(): void {}

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = false;
  }
}
