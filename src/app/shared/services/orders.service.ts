import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  baseUrlFinalizeOrders: string = `${environment.apiUrl}/api/v1/finalizedOrders`;

  constructor(private http: HttpClient) { }

  finalizedDayOrderByUser(idUsers: number, fechaInicio: Date, fechaFin: Date) {
    const init = new Date(fechaInicio);
    const end = new Date(fechaFin);
    init.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    const startDateFormat = this.formatDateToLocalString(init);
    const endDateFormat = this.formatDateToLocalString(end);
    const url = `${this.baseUrlFinalizeOrders}?idUsers=${idUsers}&fechaInicio=${encodeURIComponent(startDateFormat)}&fechaFin=${encodeURIComponent(endDateFormat)}`;

    return this.http.post<any>(url, {});
  }

  formatDateToLocalString(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
