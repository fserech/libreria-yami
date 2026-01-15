import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsReceiptsService {
  // ✅ baseUrl EXISTE para ReceiptsGrid
  baseUrl: string = `${environment.apiUrl}/api/v1/reports/orders-day`;
  // ✅ endpoint fijo para imprimir por ORDEN
  private receiptByOrderUrl = `${environment.apiUrl}/api/v1/reports/receipt`;

  constructor(private http: HttpClient) {}

  // ============================
  // RECIBOS POR USUARIO / FECHA
  // ============================
  getReceipt(typeReport: string, id_user: number, date: Date): Observable<Blob> {
    const startDate = new Date(date);
    const endDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });

    return this.http.get(
      `${this.baseUrl}?id_user=${id_user}&fecha_inicio=${this.format(startDate)}&fecha_fin=${this.format(endDate)}&typeReport=${typeReport}`,
      {
        headers,
        responseType: 'blob'
      }
    );
  }

  // ============================
  // RECIBOS PARA TODOS LOS USUARIOS
  // (Sin parámetro id_user)
  // ============================
  getReportAllUsers(typeReport: string, date: Date): Observable<Blob> {
    const startDate = new Date(date);
    const endDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });

    return this.http.get(
      `${this.baseUrl}?fecha_inicio=${this.format(startDate)}&fecha_fin=${this.format(endDate)}&typeReport=${typeReport}`,
      {
        headers,
        responseType: 'blob'
      }
    );
  }

  // ============================
  // RECIBO POR ID DE ORDEN
  // (Orders Grid)
  // ============================
  getReceiptByOrderId(orderId: number): Observable<Blob> {
    return this.http.get(
      `${this.receiptByOrderUrl}/${orderId}`,
      {
        headers: new HttpHeaders({ 'Accept': 'application/pdf' }),
        responseType: 'blob'
      }
    );
  }

  // ============================
  // UTILIDAD DE FECHA
  // ============================
  private format(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
