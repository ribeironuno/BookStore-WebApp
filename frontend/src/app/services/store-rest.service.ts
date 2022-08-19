import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '../models/store';

const endpoint = 'http://localhost:3000/store/store/';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
@Injectable({
  providedIn: 'root',
})
@Injectable({
  providedIn: 'root'
})
export class StoreRestService {

  constructor(private http: HttpClient) { }

  /**
   * GET details of the library store
   */
  getStoreInformation(): Observable<Store>{
    return this.http.get<Store>(endpoint+ 'getStore');
  }
}
