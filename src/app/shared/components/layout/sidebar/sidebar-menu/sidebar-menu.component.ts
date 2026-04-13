import { Component } from '@angular/core';
import { MenuService } from '../../../../services/menu.service';
import { SubMenuItem } from '../../../../interfaces/menu.model';
import { NgFor, NgClass, NgTemplateOutlet, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarSubmenuComponent } from '../sidebar-submenu/sidebar-submenu.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import {
  matAddShoppingCartOutline, matAltRouteOutline, matAnimationOutline,
  matCategoryOutline, matGroupOutline, matGroupsOutline, matHomeOutline,
  matInsertDriveFileOutline, matInventory2Outline, matLoyaltyOutline,
  matProductionQuantityLimitsOutline, matReceiptOutline, matShoppingBagOutline,
  matEditOutline, matCheckOutline, matDragIndicatorOutline, matArrowForwardIosOutline,
  matRefreshOutline
} from '@ng-icons/material-icons/outline';
import { URL_PERMISSIONS } from '../../../../constants/endpoints';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [
    NgFor, NgClass, NgTemplateOutlet, RouterLink, RouterLinkActive, NgIf,
    SidebarSubmenuComponent, NgIconComponent, DragDropModule
  ],
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.scss',
  viewProviders: [provideIcons({
    matHomeOutline, matGroupOutline, matGroupsOutline, matLoyaltyOutline,
    matInsertDriveFileOutline, matReceiptOutline, matInventory2Outline,
    matProductionQuantityLimitsOutline, matAddShoppingCartOutline,
    matCategoryOutline, matAnimationOutline, matAltRouteOutline,
    matShoppingBagOutline, matEditOutline, matCheckOutline,
    matDragIndicatorOutline, matArrowForwardIosOutline, matRefreshOutline
  })]
})
export class SidebarMenuComponent {
  public isEditMode: boolean = false;
  public isSaving: boolean = false;
  public userId: number;
  public userRole: string;

  constructor(
    public menuService: MenuService,
    private http: HttpClient,
    private auth: AuthService
  ) {
    // Obtener userId y role del usuario autenticado
    const user = this.auth.decodeToken();
    this.userId = this.getUserId();
    this.userRole = user?.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER';
  }

  ngOnInit(): void {
    this.menuService.setPermissions();
  }

  /**
   * Obtiene el ID del usuario actual
   * Ajusta este método según tu implementación
   */
  private getUserId(): number {
    const user = this.auth.decodeToken();

    // Opción 1: Si el userId está en el token JWT
    if ((user as any)?.userId) {
      return (user as any).userId;
    }

    // Opción 2: Si lo guardas en localStorage cuando hace login
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      return parseInt(storedUserId);
    }

    // Opción 3: Extraer del email o sub del token (ejemplo)
    // Si usas el email como ID único, podrías hacer:
    // return this.hashEmail(user?.email);

    // Valor por defecto (CAMBIAR por el ID real del usuario)
    console.warn('⚠️ No se encontró userId, usando ID por defecto: 1');
    return 1;
  }

  public toggleMenu(subMenu: SubMenuItem) {
    this.menuService.toggleMenu(subMenu);
  }

  /**
   * Maneja el evento de arrastrar y soltar
   */
  drop(event: CdkDragDrop<SubMenuItem[]>, menuGroup: any) {
    if (!this.isEditMode) return;

    // Reordenar items en el array
    moveItemInArray(menuGroup.items, event.previousIndex, event.currentIndex);

    // Guardar el nuevo orden
    this.saveMenuOrder(menuGroup.items);
  }

  /**
   * Guarda el orden del menú en el backend
   */
  saveMenuOrder(items: SubMenuItem[]) {
    this.isSaving = true;

    const payload = {
      userId: this.userId,
      role: this.userRole,
      menuItems: items.map((item) => ({
        icon: item.icon,
        label: item.label,
        route: item.route,
        visible: true
      }))
    };

    this.http.post(`${URL_PERMISSIONS}menu-order`, payload)
      .subscribe({
        next: (response: any) => {
          this.isSaving = false;
          this.showNotification('✓ Orden guardado exitosamente', 'success');
          
        },
        error: (err) => {
          this.isSaving = false;
          this.showNotification('⚠ Error al guardar. Intenta de nuevo', 'error');
          console.error('❌ Error al guardar:', err);
        }
      });
  }

  /**
   * Alterna entre modo edición y modo normal
   */
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode) {
      this.showNotification('📝 Modo edición activado - Arrastra para reordenar', 'info');
    } else {
      this.showNotification('✓ Cambios aplicados', 'success');
    }
  }

  /**
   * Muestra notificaciones toast en la esquina superior derecha
   */
  private showNotification(message: string, type: 'success' | 'error' | 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animación de entrada
    setTimeout(() => toast.classList.add('show'), 10);

    // Remover después de 3 segundos
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}
