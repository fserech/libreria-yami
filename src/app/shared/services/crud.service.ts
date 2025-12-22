import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { User } from '../interfaces/user-data';
import { URL_USERS } from '../constants/endpoints';
@Injectable({
  providedIn: 'root'
})
export class CrudService {

  baseUrl: string = `${environment.apiUrl}/api/v1/`;

  constructor(public http: HttpClient) { }

  getAllItems(url: string){}

  async getPage(sortOrder: 'asc' | 'desc', sortBy: string, pageSize: number, page: number, filters?: string): Promise<any>{
    if(filters){
      return await firstValueFrom(this.http.get<any>(`${this.baseUrl}/page?sortOrder=${sortOrder}&sortBy=${sortBy}&pageSize=${pageSize}&page=${page}${filters}`));
    }
    return await firstValueFrom(this.http.get<any>(`${this.baseUrl}/page?sortOrder=${sortOrder}&sortBy=${sortBy}&pageSize=${pageSize}&page=${page}`));
  }

 async getAll(endpoint: string): Promise<any[]> {
    return await firstValueFrom(
    this.http.get<any[]>(`${this.baseUrl}${endpoint}`)
    );
  }
  async getProductsPage(
    sortOrder: 'asc' | 'desc',
    sortBy: string,
    pageSize: number,
    page: number,
    filters?: {
      id?: number;
      productName?: string;
      initPrice?: number;
      endPrice?: number;
      active?: boolean;
    }
  ): Promise<any> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortOrder.toUpperCase());

    if (filters) {
      if (filters.id !== undefined) params = params.set('id', filters.id.toString());
      if (filters.productName) params = params.set('productName', filters.productName);
      if (filters.initPrice !== undefined) params = params.set('initPrice', filters.initPrice.toString());
      if (filters.endPrice !== undefined) params = params.set('endPrice', filters.endPrice.toString());
      if (filters.active !== undefined) params = params.set('active', filters.active.toString());
    }

    return await firstValueFrom(
      this.http.get<any>(
        `${environment.apiUrl}/api/v1/products/search`,
        { params }
      )
    );
  }

  async getUsers(id_users?: number, name?: string, email?: string,): Promise<any> {
    let params = new HttpParams();
    if (id_users !== undefined) params = params.set('id', id_users.toString());
    if (name) params = params.set('name', name);
    if (email) params = params.set('email', email);

 return await firstValueFrom(this.http.get<any>(`${this.baseUrl}`));
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${URL_USERS}/${id}`);
  }

  async getUserById(id: number): Promise<any> {
    return await firstValueFrom(
      this.http.get<any>(`${URL_USERS}/${id}`)
    );
  }

  getUserByIdWithParams(id: number): Observable<User> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.get<User>(`${URL_USERS}`, { params });
  }

  getUserForClients(id: number): Observable<User> {
    return this.http.get<User>(`${URL_USERS}/page?id=${id}`);
  }

  async getUsersForClients(id_users?: number, name?: string, email?: string,): Promise<any> {
    let params = new HttpParams();
    if (id_users !== undefined) params = params.set('id', id_users.toString());
    if (name) params = params.set('name', name);
    if (email) params = params.set('email', email);

  return await firstValueFrom(this.http.get<any>(`${URL_USERS}`));
  }

  updateUser(id: number, data: any): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}`, data);
}



  getId(id: number){
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  updateId(id: number, data: any){
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }


  async deleteId(id: any): Promise<any> {
    return await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`))
  }

  save(data: any){
    return this.http.post<any>(`${this.baseUrl}`, data);
  }

}
