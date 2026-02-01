// ======================================================
// ARCHIVO COMPLETO: inventory.service.ts
// ======================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { InventorySummary, MovementFilter, ProductStock, StockAdjustment, StockMovement } from '../interfaces/inventory';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/api/v1/inventory`;

  constructor(private http: HttpClient) {}

  getMovements(
    filter: MovementFilter,
    page: number = 1,
    limit: number = 20
  ): Observable<{ data: StockMovement[], total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
    if (filter.productId) params = params.set('productId', filter.productId.toString());
    if (filter.movementType) params = params.set('movementType', filter.movementType);
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);
    if (filter.userId) params = params.set('userId', filter.userId.toString());

    return this.http.get<any>(`${this.apiUrl}/movements`, { params }).pipe(
      map(response => ({
        data: response.data || [],
        total: response.total || 0
      }))
    );
  }

  getLowStockProducts(branchId?: number): Observable<ProductStock[]> {
    const params = branchId
      ? new HttpParams().set('branchId', branchId.toString())
      : new HttpParams();

    return this.http.get<ProductStock[]>(
      `${this.apiUrl}/stock/low-stock`,
      { params }
    );
  }

  getStockByBranch(branchId: number): Observable<ProductStock[]> {
    return this.http.get<ProductStock[]>(
      `${this.apiUrl}/stock/branch/${branchId}`
    );
  }

  createAdjustment(adjustmentData: any): Observable<any> {
    const payload = {
      productId: Number(adjustmentData.productId),
      variantId: adjustmentData.variantId ? Number(adjustmentData.variantId) : null,
      branchId: Number(adjustmentData.branchId),
      quantity: Number(adjustmentData.quantity),
      reason: adjustmentData.reason,
      notes: adjustmentData.notes || '',
      movementType: 'ADJUSTMENT'
    };

    const endpoint = payload.variantId
      ? `${this.apiUrl}/adjustments/variant`
      : `${this.apiUrl}/adjustments`;

    console.log('📤 Enviando ajuste a:', endpoint, payload);

    return this.http.post<any>(endpoint, payload);
  }

  getInventorySummary(branchId?: number): Observable<InventorySummary> {
    const params = branchId
      ? new HttpParams().set('branchId', branchId.toString())
      : new HttpParams();

    return this.http.get<InventorySummary>(
      `${this.apiUrl}/summary`,
      { params }
    );
  }

  exportMovements(filter: MovementFilter): Observable<Blob> {
    let params = new HttpParams();

    if (filter.branchId) {
      params = params.set('branchId', filter.branchId.toString());
    }
    if (filter.productId) {
      params = params.set('productId', filter.productId.toString());
    }
    if (filter.movementType) {
      params = params.set('movementType', filter.movementType);
    }
    if (filter.startDate) {
      params = params.set('startDate', filter.startDate);
    }
    if (filter.endDate) {
      params = params.set('endDate', filter.endDate);
    }
    if (filter.userId) {
      params = params.set('userId', filter.userId.toString());
    }

    console.log('📤 Exportando movimientos con parámetros:', params.toString());

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        console.log('📥 Respuesta recibida:', response.headers.get('content-type'));
        return response.body as Blob;
      })
    );
  }

  // ⭐ NUEVO: Exportar alertas de stock bajo
  exportLowStockAlerts(filter?: any): Observable<Blob> {
    let params = new HttpParams();

    if (filter?.branchId) {
      params = params.set('branchId', filter.branchId.toString());
    }
    if (filter?.alertLevel && filter.alertLevel !== 'all') {
      params = params.set('alertLevel', filter.alertLevel);
    }

    console.log('📤 Exportando alertas con parámetros:', params.toString());

    return this.http.get(`${this.apiUrl}/export/low-stock`, {
      params,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        console.log('📥 Respuesta recibida:', response.headers.get('content-type'));
        return response.body as Blob;
      })
    );
  }

  // ⭐ NUEVO: Exportar todas las existencias
  exportAllStock(filter?: any): Observable<Blob> {
    let params = new HttpParams();

    if (filter?.branchId) {
      params = params.set('branchId', filter.branchId.toString());
    }

    console.log('📤 Exportando existencias con parámetros:', params.toString());

    return this.http.get(`${this.apiUrl}/export/all-stock`, {
      params,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        console.log('📥 Respuesta recibida:', response.headers.get('content-type'));
        return response.body as Blob;
      })
    );
  }

  getProductHistory(
    productId: number,
    variantId?: number | null
  ): Observable<StockMovement[]> {
    let params = new HttpParams().set('productId', productId.toString());

    if (variantId) params = params.set('variantId', variantId.toString());

    return this.http.get<StockMovement[]>(
      `${this.apiUrl}/product-history`,
      { params }
    );
  }

  getAllProductStock(branchId?: number): Observable<ProductStock[]> {
    let url = `${this.apiUrl}/stock`;

    if (branchId) {
      url += `?branchId=${branchId}`;
    }

    return this.http.get<ProductStock[]>(url);
  }
}
