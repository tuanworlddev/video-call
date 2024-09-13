import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';

  constructor(private httpClient: HttpClient) { }

  getAuthToken(): string | null {
    return localStorage.getItem("token");
  }

  login(email: string, password: string): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/login`, { email, password });
  }

}
