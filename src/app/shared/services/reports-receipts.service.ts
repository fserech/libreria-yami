import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportsReceiptsService {
  baseUrl: string = `${environment.apiUrl}/api/v1/`;

  constructor(private http: HttpClient) { }


  getReceipt(typeReport: string, id_user: number, date: Date){

    const startDate = new Date(date);
    const endDate = new Date(date);
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    const startDateFormat = this.formatDateToISOString(startDate);
    const endDateFormat = this.formatDateToISOString(endDate);

    return this.http.get(`${this.baseUrl}?id_user=${id_user}&fecha_inicio=${startDateFormat}&fecha_fin=${endDateFormat}&typeReport=${typeReport}`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  getReportPanel(typeReport: string, date: Date, panel: string){
    const startDate = new Date(date);
    const endDate = new Date(date);
    const headers = new HttpHeaders({
      'Content-Type': 'application/pdf'
    });

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    const startDateFormat = this.formatDateToISOString(startDate);
    const endDateFormat = this.formatDateToISOString(endDate);
    return this.http.get(`${this.baseUrl}?fecha_Inicio=${startDateFormat}&fecha_Fin=${endDateFormat}&panel=${panel}&typeReport=${typeReport}`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  formatDateToISOString(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
