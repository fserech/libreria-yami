import { Component, Input, OnChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matPrintOutline,
  matDownloadOutline,
  matCloseOutline,
  matQrCodeOutline,
} from '@ng-icons/material-icons/outline';
import { MakeArrayPipe } from '../../../../../shared/pipes/array.pipe';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


// ─── Interfaz pública ────────────────────────────────────────────────────────
export interface SkuLabelItem {
  sku: string;
  name: string;                          // product_name  o  variant_name
  brandName?: string;
  price?: number;
  attributes?: { [key: string]: string }; // solo variantes
}

// ─── Opciones de layout ──────────────────────────────────────────────────────
export type LabelsPerPage = 6 | 10 | 12 | 20;   // 2×3 | 2×5 | 3×4 | 4×5

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

  // ── ViewChild para capturar el contenido ────────────────────────────────
  @ViewChild('labelsContent') labelsContent!: ElementRef;

  // ── Inputs ───────────────────────────────────────────────────────────────
  @Input() items: SkuLabelItem[] = [];
  @Input() copies: number = 1;

  // ── Estado interno ───────────────────────────────────────────────────────
  labelsPerPage: LabelsPerPage = 12;
  expandedLabels: SkuLabelItem[] = [];
  pages: SkuLabelItem[][] = [];
  isExporting: boolean = false;

  // ── Opciones de layout disponibles ───────────────────────────────────────
  readonly layoutOptions: { value: LabelsPerPage; label: string; cols: number; rows: number }[] = [
    { value: 6,  label: '6 etiquetas  (2 × 3)', cols: 2, rows: 3 },
    { value: 10, label: '10 etiquetas (2 × 5)', cols: 2, rows: 5 },
    { value: 12, label: '12 etiquetas (3 × 4)', cols: 3, rows: 4 },
    { value: 20, label: '20 etiquetas (4 × 5)', cols: 4, rows: 5 },
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
    this.expandedLabels = [];
    for (const label of this.items) {
      for (let i = 0; i < this.copies; i++) {
        this.expandedLabels.push(label);
      }
    }

    this.pages = [];
    const size = this.labelsPerPage;
    for (let i = 0; i < this.expandedLabels.length; i += size) {
      this.pages.push(this.expandedLabels.slice(i, i + size));
    }
  }

  // ── Cambio de layout ─────────────────────────────────────────────────────
  changeLayout(event: Event): void {
    const value = +(event.target as HTMLSelectElement).value;
    if ([6, 10, 12, 20].includes(value)) {
      this.labelsPerPage = value as LabelsPerPage;
      this.rebuildPages();
    }
  }

  // ── Cambio de copias ─────────────────────────────────────────────────────
  changeCopies(value: number): void {
    this.copies = Math.max(1, Math.min(20, value));
    this.rebuildPages();
  }

  changeCopiesFromInput(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.changeCopies(value);
  }

  // ── Generar barra de texto (simulada) ────────────────────────────────────
  generateBarcode(sku: string): string[] {
    const bars: string[] = [];
    for (const ch of sku.toUpperCase()) {
      const code = ch.charCodeAt(0);
      for (let i = 0; i < 5; i++) {
        const bit = (code >> i) & 1;
        bars.push(bit ? 'T' : 'N');
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

  // ── Exportar a PDF ───────────────────────────────────────────────────────
  async exportToPDF(): Promise<void> {
    if (this.items.length === 0) return;

    this.isExporting = true;

    try {
      const pdf = new jsPDF('p', 'mm', 'letter');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Obtener todos los elementos de página
      const pageElements = document.querySelectorAll('.label-page');

      for (let i = 0; i < pageElements.length; i++) {
        const pageElement = pageElements[i] as HTMLElement;

        // Capturar la página como canvas
        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        // Agregar nueva página si no es la primera
        if (i > 0) {
          pdf.addPage();
        }

        // Agregar imagen al PDF
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      // Generar nombre del archivo con fecha
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `etiquetas-sku-${fecha}.pdf`;

      // Descargar el PDF
      pdf.save(nombreArchivo);

    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta de nuevo.');
    } finally {
      this.isExporting = false;
    }
  }
}
