import { Component } from '@angular/core';
import { SidebarMenuComponent } from './sidebar-menu/sidebar-menu.component';
import { SidebarSubmenuComponent } from './sidebar-submenu/sidebar-submenu.component';
import { NgClass, NgIf } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';
import { MenuService } from '../../../services/menu.service';
// import packageJson from '../../../../../../package.json';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matKeyboardDoubleArrowLeftOutline, matLogOutOutline } from '@ng-icons/material-icons/outline';
import { matLightModeRound, matDarkModeRound } from '@ng-icons/material-icons/round';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgClass, NgIf,
    SidebarMenuComponent,
    SidebarSubmenuComponent, NgIconComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  viewProviders: [
    provideIcons({
        matLightModeRound,
        matDarkModeRound,
        matLogOutOutline,
        matKeyboardDoubleArrowLeftOutline
      })]
})
export class SidebarComponent {

  // public appJson: any = packageJson;

  constructor(public themeService: ThemeService, public menuService: MenuService) {}

  ngOnInit(): void {}

  public toggleSidebar() {
    this.menuService.toggleSidebar();
  }

  toggleTheme() {
    this.themeService.theme = !this.themeService.isDark ? 'dark' : 'light';
  }


}
