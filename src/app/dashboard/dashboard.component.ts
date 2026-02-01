import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../shared/components/layout/navbar/navbar.component';
import { SidebarComponent } from '../shared/components/layout/sidebar/sidebar.component';
import { FooterComponent } from '../shared/components/layout/footer/footer.component';
import { BottomNavbarComponent } from '../shared/components/layout/bottom-navbar/bottom-navbar.component';
import { AuthService } from '../shared/services/auth.service';
import { Subscription } from 'rxjs';
import { MenuService } from '../shared/services/menu.service';
import { SelectComponent } from '../shared/components/select/select.component';
import { DatePickerComponent } from '../shared/components/date-picker/date-picker.component';
import { HeaderComponent } from "../shared/components/header/header.component";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    imports: [RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent, BottomNavbarComponent, SelectComponent, DatePickerComponent, HeaderComponent]
})
export default class DashboardComponent implements OnInit {

  tokenExpired = false;
  private tokenSubscription: Subscription | undefined;

  constructor(private authService: AuthService, private router: Router, private menuService: MenuService){}


  ngOnInit(): void {

    this.authService.tokenExpired$.subscribe(expired => {
      this.tokenExpired = expired;
      if (this.tokenExpired) {
        this.router.navigate(['/authentication']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.tokenSubscription) {
      this.tokenSubscription.unsubscribe();
      this.menuService.ngOnDestroy();
    }
  }

}
