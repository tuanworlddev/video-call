import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Country } from '../interfaces/country';
import { Observable } from 'rxjs';
import { Location } from '../interfaces/location';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private apiUrl = 'http://localhost:8080/api/countries';

  constructor(private httpClient: HttpClient) {}

  getAllCountries(): Observable<Country[]> {
    return this.httpClient.get<Country[]>(this.apiUrl);
  }

  getCurrentLocation(): Observable<Location> {
    return this.httpClient.get<Location>(
      'https://ipinfo.io/json?token=110bb20b2b2b44'
    );
  }

  getCountryByCode(code: string): Observable<Country> {
    return this.httpClient.get<Country>(`${this.apiUrl}/${code}`);
  }
}
