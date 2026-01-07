// shared/services/branch.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Branch } from '../interfaces/branch';
import { InputOptionsSelect } from '../interfaces/input';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private apiUrl = `${environment.apiUrl}/api/v1/branches`;

  constructor(private http: HttpClient) {}

  getActiveBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}?active=true`);
  }

  getBranchOptions(): Promise<InputOptionsSelect[]> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${this.apiUrl}?active=true`).subscribe({
        next: (response) => {
          const branches = Array.isArray(response)
            ? response
            : (response.content || []);

          const options = branches.map((branch: Branch) => ({
            value: branch.id.toString(),
            label: branch.name
          }));

          resolve(options);
        },
        error: (error) => reject(error)
      });
    });
  }

  getUserBranches(userId: number): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}?idUser=${userId}`);
  }
}
