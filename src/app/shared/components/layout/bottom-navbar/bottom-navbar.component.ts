import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matArrowForwardIosOutline, matGroupOutline, matGroupsOutline, matHomeOutline, matInsertDriveFileOutline, matLocalShippingOutline, matLoyaltyOutline, matReceiptOutline, matTodayOutline } from '@ng-icons/material-icons/outline';
import { MenuService } from '../../../services/menu.service';
import { AuthService } from '../../../services/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
@Component({
  selector: 'app-bottom-navbar',
  standalone: true,
  imports: [
    NgIconComponent,
    RouterLink,
    RouterLinkActive,NgIf, NgFor],
  templateUrl: './bottom-navbar.component.html',
  styleUrl: './bottom-navbar.component.scss',
  viewProviders: [provideIcons({
    matHomeOutline,
    matGroupOutline,
    matGroupsOutline,
    matLoyaltyOutline,
    matLocalShippingOutline,
    matInsertDriveFileOutline,
    matTodayOutline,
    matReceiptOutline,
    matArrowForwardIosOutline
     })]
})
export class BottomNavbarComponent implements OnInit, OnDestroy {

  constructor(public menuService: MenuService, public authService: AuthService) {}

  ngOnDestroy(): void {}

  ngOnInit(): void {
  }

}

