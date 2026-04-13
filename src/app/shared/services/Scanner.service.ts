import { Injectable, OnDestroy } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Product, ProductVariant } from '../interfaces/product';
import { getProductCostPrice } from '../utils/product-utils';


export interface ScannedProductResult {
  product: Product;
  variantId?: number;
}

@Injectable()
export class ScannerService implements OnDestroy {
  // Evento que se emite cuando se encuentra un producto por SKU
  productScanned = new EventEmitter<ScannedProductResult>();

  // Estado público para que el componente lo lea
  scannerEnabled: boolean = true;
  scannerStatus: 'idle' | 'scanning' | 'success' | 'error' = 'idle';
  lastScannedSku: string = '';

  // Internos
  private barcodeBuffer: string = '';
  private barcodeTimeout: any;
  private readonly BARCODE_TIMEOUT = 100;
  private products: Product[] = [];
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor() {}

  // Debe llamarse cuando los productos están cargados
  setProducts(products: Product[]) {
    this.products = products;
  }

  // Activa el listener global de teclado
  startListening() {
    this.keydownHandler = (event: KeyboardEvent) => this.handleBarcodeInput(event);
    window.addEventListener('keypress', this.keydownHandler);
  }

  // Detiene el listener global
  stopListening() {
    if (this.keydownHandler) {
      window.removeEventListener('keypress', this.keydownHandler);
      this.keydownHandler = null;
    }
    this.cleanup();
  }

  toggleScanner() {
    this.scannerEnabled = !this.scannerEnabled;

    if (this.scannerEnabled) {
      this.startListening();
    } else {
      this.stopListening();
      this.barcodeBuffer = '';
      this.scannerStatus = 'idle';
    }
  }

  private handleBarcodeInput(event: KeyboardEvent) {
    if (!this.scannerEnabled) return;

    // Ignorar si el usuario está escribiendo en un input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    // Enter indica fin del código de barras
    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length > 0) {
        this.processBarcodeInput(this.barcodeBuffer);
        this.barcodeBuffer = '';
      }
      event.preventDefault();
      return;
    }

    // Acumular caracteres
    this.barcodeBuffer += event.key;
    this.scannerStatus = 'scanning';

    // Reset timeout
    if (this.barcodeTimeout) {
      clearTimeout(this.barcodeTimeout);
    }

    this.barcodeTimeout = setTimeout(() => {
      if (this.barcodeBuffer.length > 0) {
        this.processBarcodeInput(this.barcodeBuffer);
        this.barcodeBuffer = '';
      }
    }, this.BARCODE_TIMEOUT);
  }

  private processBarcodeInput(scannedCode: string) {
    const sku = scannedCode.trim().toUpperCase();

    if (!sku) {
      this.scannerStatus = 'idle';
      return;
    }

   
    this.lastScannedSku = sku;

    const result = this.findProductBySku(sku);

    if (!result) {
      this.scannerStatus = 'error';
      // Emitir null para que el componente muestre el toast de error
      this.productScanned.emit(null as any);

      setTimeout(() => {
        this.scannerStatus = 'idle';
        this.lastScannedSku = '';
      }, 2000);
      return;
    }

    this.scannerStatus = 'success';

    // Emitir el resultado
    if (result.variant) {
      const variantProduct: Product = {
        ...result.product,
        id: result.product.id,
        productName: `${result.product.productName} - ${result.variant.variantName}`,
        sku: result.variant.sku,
        salePrice: result.variant.salePrice,
        costPrice: getProductCostPrice(result.variant),
        currentStock: result.variant.currentStock,
        hasVariants: false,
        averageCostPrice: (result.variant as any).averageCostPrice
      };

      this.productScanned.emit({
        product: variantProduct,
        variantId: result.variant.id
      });
    } else {
      this.productScanned.emit({
        product: result.product
      });
    }

    setTimeout(() => {
      this.scannerStatus = 'idle';
      this.lastScannedSku = '';
    }, 1000);
  }

  private findProductBySku(sku: string): { product: Product; variant?: ProductVariant } | null {
    for (const product of this.products) {
      if (product.sku?.toUpperCase() === sku && !product.hasVariants) {
        return { product };
      }

      if (product.hasVariants && product.variants) {
        const variant = product.variants.find(v => v.sku?.toUpperCase() === sku);
        if (variant) {
          return { product, variant };
        }
      }
    }

    return null;
  }

  private cleanup() {
    if (this.barcodeTimeout) {
      clearTimeout(this.barcodeTimeout);
    }
  }

  ngOnDestroy() {
    this.stopListening();
  }
}
