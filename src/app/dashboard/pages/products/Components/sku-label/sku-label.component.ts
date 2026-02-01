import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matPrintOutline,
  matDownloadOutline,
  matCloseOutline,
  matQrCodeOutline,
} from '@ng-icons/material-icons/outline';
import { MakeArrayPipe } from '../../../../../shared/pipes/array.pipe';


// ─── Interfaz pública ────────────────────────────────────────────────────────
export interface SkuLabelItem {
  sku: string;
  name: string;                          // product_name  o  variant_name
  brandName?: string;
  price?: number;
  attributes?: { [key: string]: string }; // solo variantes
}

// ─── Opciones de layout ──────────────────────────────────────────────────────
export type LabelsPerPage = 6 | 10 | 12;   // 2×3 | 2×5 | 3×4

@Component({
  selector: 'app-sku-label',
  standalone: true,
  imports: [CommonModule, NgIconComponent, MakeArrayPipe],
  templateUrl: './sku-label.component.html',
  styleUrl:  './sku-label.component.scss',
  viewProviders: [provideIcons({
    matPrintOutline,
    matDownloadOutline,
    matCloseOutline,
    matQrCodeOutline,
  })]
})
export class SkuLabelComponent implements OnChanges {

  // ── Inputs ───────────────────────────────────────────────────────────────
  @Input() labels: SkuLabelItem[] = [];
  @Input() copies: number = 1;           // copias por etiqueta

  // ── Estado interno ───────────────────────────────────────────────────────
  labelsPerPage: LabelsPerPage = 6;
  expandedLabels: SkuLabelItem[] = [];   // labels × copies
  pages: SkuLabelItem[][] = [];          // agrupa por página

  // ── Opciones de layout disponibles ───────────────────────────────────────
  readonly layoutOptions: { value: LabelsPerPage; label: string; cols: number; rows: number }[] = [
    { value: 6,  label: '6 etiquetas  (2 × 3)', cols: 2, rows: 3 },
    { value: 10, label: '10 etiquetas (2 × 5)', cols: 2, rows: 5 },
    { value: 12, label: '12 etiquetas (3 × 4)', cols: 3, rows: 4 },
  ];

  get currentLayout() {
    return this.layoutOptions.find(o => o.value === this.labelsPerPage)!;
  }

  // ── Ciclo de vida ────────────────────────────────────────────────────────
  ngOnChanges() {
    this.rebuildPages();
  }

  // ── Reconstruir páginas ──────────────────────────────────────────────────
  rebuildPages(): void {
    // Expandir copias
    this.expandedLabels = [];
    for (const label of this.labels) {
      for (let i = 0; i < this.copies; i++) {
        this.expandedLabels.push(label);
      }
    }

    // Partir en páginas
    this.pages = [];
    const size = this.labelsPerPage;
    for (let i = 0; i < this.expandedLabels.length; i += size) {
      this.pages.push(this.expandedLabels.slice(i, i + size));
    }
  }

  // ── Cambio de layout ─────────────────────────────────────────────────────
  changeLayout(event: Event): void {
    const value = +(event.target as HTMLSelectElement).value;
    if ([6, 10, 12].includes(value)) {
      this.labelsPerPage = value as LabelsPerPage;
      this.rebuildPages();
    }
  }

  // ── Cambio de copias ─────────────────────────────────────────────────────
  changeCopies(value: number): void {
    this.copies = Math.max(1, Math.min(20, value));
    this.rebuildPages();
  }

  // ── Cambio de copias desde input ─────────────────────────────────────────
  changeCopiesFromInput(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.changeCopies(value);
  }

  // ── Generar barra de texto (simulada) ────────────────────────────────────
  // Cada carácter del SKU se convierte en una serie de barras delgadas/gruesas
  // usando un mapeo determinista basado en charCodeAt
  generateBarcode(sku: string): string[] {
    const bars: string[] = [];
    for (const ch of sku.toUpperCase()) {
      const code = ch.charCodeAt(0);
      // 5 barras por carácter: ancho determinista según el código
      for (let i = 0; i < 5; i++) {
        const bit = (code >> i) & 1;
        bars.push(bit ? 'T' : 'N'); // T = thick, N = narrow
      }
    }
    return bars;
  }

  // ── Obtener atributos como array ─────────────────────────────────────────
  getAttributeEntries(attributes: { [key: string]: string } | undefined): { key: string; value: string }[] {
    if (!attributes) return [];
    return Object.entries(attributes).map(([key, value]) => ({ key, value }));
  }

  // ── Imprimir ─────────────────────────────────────────────────────────────
  print(): void {
    window.print();
  }
}
