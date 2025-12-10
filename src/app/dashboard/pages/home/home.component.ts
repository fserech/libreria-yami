import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CrudService } from '../../../shared/services/crud.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../shared/services/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MenuService } from '../../../shared/services/menu.service';
import { Route, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matHomeOutline, matGroupOutline, matGroupsOutline, matLoyaltyOutline, matLocalShippingOutline, matInsertDriveFileOutline, matTodayOutline, matReceiptOutline, matArrowForwardIosOutline, matShoppingBagOutline } from '@ng-icons/material-icons/outline';
import { HeaderComponent } from '../../../shared/components/header/header.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIconComponent, RouterLink,
            RouterLinkActive, HeaderComponent],
  providers:[],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
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
    matShoppingBagOutline
     })]
})
export default class HomeComponent implements OnInit {

  permissions: any[] = [];

  // Define los módulos que QUIERES mostrar en el centro
  private allowedModules = [
    'Roles y usuarios',
    'Clientes',
    'Productos',
    'Ventas',
    'Reportes',
    'Recibos'
  ];

  constructor(
    public auth: AuthService,
    public menuService: MenuService,
    private router: Router) {
    this.menuService
    .getPermissions()
    .subscribe({
      next:(res: any) => {
         this.permissions = res.pages[0].items.filter((item: any) =>
            this.allowedModules.includes(item.label)
          );
      },
      error:(error: any) => {
        console.log(error);
      }
    })
  }

  ngOnInit(): void {}

  navigateRoute(route: string){
    this.router.navigate([route]);
  }
}
