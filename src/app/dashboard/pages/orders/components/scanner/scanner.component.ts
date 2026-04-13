import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matQrCodeScannerOutline,
  matCheckCircleOutline,
  matCancelOutline,
} from '@ng-icons/material-icons/outline';

import { Product } from '../../../../../shared/interfaces/product';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ScannedProductResult, ScannerService } from '../../../../../shared/services/Scanner.service';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent
  ],
  providers: [ScannerService],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.scss',
  viewProviders: [provideIcons({
    matQrCodeScannerOutline,
    matCheckCircleOutline,
    matCancelOutline,
  })]
})
export class ScannerComponent implements OnInit, OnDestroy {

  // Recibe la lista de productos desde el padre
  @Input() set products(value: Product[]) {
    if (value) {
      this.scannerService.setProducts(value);
    }
  }

  // Emite el producto encontrado al padre
  @Output() productScanned = new EventEmitter<ScannedProductResult>();

  constructor(
    public scannerService: ScannerService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    // Suscribirse al evento del servicio
    this.scannerService.productScanned.subscribe((result) => {
      if (!result) {
        // SKU no encontrado
        this.toast.error(`SKU no encontrado: ${this.scannerService.lastScannedSku}`, 'Error de escaneo');
      } else {
        // Producto encontrado, emitir al padre
        this.productScanned.emit(result);
        this.toast.success(
          `✅ ${result.product.productName} agregado (SKU: ${result.product.sku})`,
          'Producto escaneado'
        );
      }
    });

    // Iniciar escucha si está habilitado
    if (this.scannerService.scannerEnabled) {
      this.scannerService.startListening();

    }
  }

  ngOnDestroy() {
    this.scannerService.stopListening();
  }

  // Getters para el template — leen directamente del servicio
  get scannerEnabled(): boolean {
    return this.scannerService.scannerEnabled;
  }

  get scannerStatus(): 'idle' | 'scanning' | 'success' | 'error' {
    return this.scannerService.scannerStatus;
  }

  get lastScannedSku(): string {
    return this.scannerService.lastScannedSku;
  }

  toggleScanner() {
    this.scannerService.toggleScanner();

    if (this.scannerService.scannerEnabled) {
      this.toast.success('Lector de códigos activado', 'Escáner');
    
    } else {
      this.toast.info('Lector de códigos desactivado', 'Escáner');
      
    }
  }
}
