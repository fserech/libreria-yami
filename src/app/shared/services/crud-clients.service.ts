import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../interfaces/user-data';

@Injectable({
  providedIn: 'root'
})
export class CrudClientsService {

  baseUrl: string = `${environment.apiUrl}/api/v1/`;

  constructor(private http: HttpClient) { }

  getAllItems(url: string){}

  async getPage(sortOrder: 'asc' | 'desc', sortBy: string, pageSize: number, page: number, filters?: string): Promise<any>{
    if(filters){
      return await firstValueFrom(this.http.get<any>(`${this.baseUrl}/page?sortOrder=${sortOrder}&sortBy=${sortBy}&pageSize=${pageSize}&page=${page}${filters}`));
    }
    return await firstValueFrom(this.http.get<any>(`${this.baseUrl}/page?sortOrder=${sortOrder}&sortBy=${sortBy}&pageSize=${pageSize}&page=${page}`));
  }

  async getUsers(id_users?: number, name?: string, email?: string,): Promise<any> {
    let params = new HttpParams();
    if (id_users !== undefined) params = params.set('id', id_users.toString());
    if (name) params = params.set('name', name);
    if (email) params = params.set('email', email);

 return await firstValueFrom(this.http.get<any>(`${this.baseUrl}`));
  }

  getUser(id: number): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}/page?id=${id}`);
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

