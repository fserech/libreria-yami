import { Component, OnInit } from '@angular/core';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { NavbarMenuComponent } from './navbar-menu/navbar-menu.component';
import { NavbarMobileComponent } from './navbar-mobile/navbar-mobile.component';
import { MenuService } from '../../../services/menu.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matMenuRound } from '@ng-icons/material-icons/round';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
        NavbarMenuComponent,
        ProfileMenuComponent,
        NavbarMobileComponent,
        NgIconComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  viewProviders: [provideIcons({ matMenuRound })]
})
export class NavbarComponent implements OnInit {

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {}

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = true;
  }

}
