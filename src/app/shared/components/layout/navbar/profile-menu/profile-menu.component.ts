import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClickOutsideDirective } from '../../../../directives/click-outside.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matAccountCircleOutline, matChecklistOutline, matLogOutOutline, matPerson2Outline } from '@ng-icons/material-icons/outline';
import { ThemeService } from '../../../../services/theme.service';
import { matDarkModeRound, matLightModeRound } from '@ng-icons/material-icons/round';
import { AuthService } from '../../../../services/auth.service';
import { UserProfile } from '../../../../interfaces/user-profile';
import { OrdersService } from '../../../../services/orders.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { ToastService } from '../../../../services/toast.service';
// import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [ClickOutsideDirective, NgClass, RouterLink, NgIconComponent],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
  viewProviders: [
    provideIcons({ matChecklistOutline, matLogOutOutline, matLightModeRound, matDarkModeRound, matPerson2Outline, matAccountCircleOutline })
  ]
})
export class ProfileMenuComponent implements OnInit {

  public isMenuOpen = false;
  user: UserProfile = null;

  constructor(public themeService: ThemeService,
              private authService: AuthService,
              private router: Router,
              private orderService: OrdersService,
              private toast: ToastService,) {}

  ngOnInit(): void {
    this.user = this.getUserData();
  }

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleTheme() {
    this.themeService.theme = !this.themeService.isDark ? 'dark' : 'light';
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['/authentication']);
  }

  getUserData(){
    return this.authService.decodeToken();
  }

  navigateToProfile(){
    this.router.navigate(['/dashboard/profile']);
  }

  endDay(){
    const id: number = this.authService.getUserData().id;
    const name: string = this.authService.getUserData().sub;
    const date: Date = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    const formattedDate = date.toLocaleDateString('es-ES', options);

    this.toast
      .confirm(`Confirmación`,null, null,`Hola ${name}, Deseas finalizar tus pedidos ingresados hoy, ${formattedDate}?`, 'question')
      .then((res: any) => {
        if(res && res.isConfirmed){
          firstValueFrom(this.orderService.finalizedDayOrderByUser(id, date, date))
          .then((response: any) => {
            if(response.code === 200){
              this.toast.success(response.message);
              if(this.getCurrentUrl() === '/dashboard/orders'){
                window.location.reload();
              }else{
                this.router.navigate(['/dashboard/orders']);
              }
            }else{
              this.toast.warning(response.message);
            }
          })
          .catch((error: any) => {
            this.toast.error('ocurrio un error en la confirmación.')
          });
        }
      });
  }

  getRole(): string{
    return (this.authService && this.authService.getUserData()) ? this.authService.getUserData().role : '';
  }

  getCurrentUrl(): string {
    return this.router.url;
  }
}
