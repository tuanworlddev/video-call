import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Filter} from "../interfaces/filter";

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private apiUrl: string = 'http://localhost:8080/api/filters';

  constructor(private httpClient: HttpClient) { }

  getAllFilters(): Observable<Filter[]> {
    return this.httpClient.get<Filter[]>(this.apiUrl);
  }
}
