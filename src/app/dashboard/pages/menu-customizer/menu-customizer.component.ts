// src/app/dashboard/pages/menu-customizer/menu-customizer.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { URL_PERMISSIONS } from '../../../shared/constants/endpoints';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  visible: boolean;
}

@Component({
  selector: 'app-menu-customizer',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './menu-customizer.component.html',
  styles: [`
    .menu-item {
      transition: all 0.3s ease;
    }

    .cdk-drag-preview {
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      opacity: 0.8;
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
      background: #e2e8f0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class MenuCustomizerComponent implements OnInit {
  menuItems: MenuItem[] = [];
  userId: number = 1;
  userRole: string = 'ADMIN';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMenuItems();
  }

  loadMenuItems() {
    this.http.get<any>(`${URL_PERMISSIONS}${this.userRole.toLowerCase()}?userId=${this.userId}`)
      .subscribe(response => {
        this.menuItems = response.pages[0].items.map((item: any) => ({
          ...item,
          visible: true
        }));
      });
  }

  drop(event: CdkDragDrop<MenuItem[]>) {
    moveItemInArray(this.menuItems, event.previousIndex, event.currentIndex);
  }

  toggleVisibility(item: MenuItem) {
    item.visible = !item.visible;
  }

  saveOrder() {
    const payload = {
      userId: this.userId,
      role: this.userRole,
      menuItems: this.menuItems
    };

    this.http.post(`${URL_PERMISSIONS}menu-order`, payload)
      .subscribe({
        next: () => {
          alert('Orden guardado exitosamente');
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          alert('Error al guardar el orden del menú');
        }
      });
  }

  resetOrder() {
    this.http.delete(`${URL_PERMISSIONS}menu-order/reset?userId=${this.userId}&role=${this.userRole}`)
      .subscribe({
        next: () => {
          this.loadMenuItems();
          alert('Orden restablecido');
        },
        error: (err) => {
          console.error('Error al restablecer:', err);
          alert('Error al restablecer el orden del menú');
        }
      });
  }
}
