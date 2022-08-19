import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { audit, Observable } from 'rxjs';
import { Client } from '../models/client';
import { ClientPurchase } from '../models/clientPurchase';
import { ClientSale } from '../models/clientSale';
import { FormClient } from '../models/formClient';
import { AuthService } from './auth/auth.service';

const endpoint = 'http://localhost:3000/store/';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

const invoiceOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
  responseType: 'text' as 'json',
};

@Injectable({
  providedIn: 'root',
})
export class ClientRestService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  /*
   * Registration of a client
   */
  createClient(client: FormClient): Observable<Client> {
    return this.http.post<Client>(
      endpoint + 'client/create',
      client,
      httpOptions
    );
  }

  /**
   * Associates a password to a client
   */
  completeRegistration(email: string, password: string) {
    return this.http.post<Client>(
      endpoint + 'client/completeRegistration',
      { email: email, password: password },
      httpOptions
    );
  }

  /*
   * Edit of a client
   */
  editClient(client: Client, nif: number): Observable<Client> {
    console.log(nif);
    return this.http.post<Client>(
      endpoint + `client/edit/` + nif,
      client,
      httpOptions
    );
  }

  /**
   * Returns the list of sales made by the logged client
   */
  getSalesOfActualClient(): Observable<ClientSale[]> {
    return this.http.post<ClientSale[]>(
      endpoint + 'purchases/getPurchasesByToken',
      JSON.stringify({ token: this.auth.getToken() }),
      httpOptions
    );
  }

  /**
   * Returns the list of purchases made by the logged client
   */
  getPurchasesOfActualClient(): Observable<ClientPurchase[]> {
    return this.http.post<ClientPurchase[]>(
      endpoint + 'sales/getSalesByToken',
      JSON.stringify({ token: this.auth.getToken() }),
      httpOptions
    );
  }

  /**
   * Returns the path of the invoice document
   */
  getPurchaseInvoice(docId: number): Observable<any> {
    return this.http.post<any>(
      endpoint + 'purchases/generatePdfCredit',
      JSON.stringify({ token: this.auth.getToken(), docId: docId }),
      invoiceOptions
    );
  }

  /**
   * Returns the path of the invoice document
   */
   getShippingSticker(docId: number): Observable<any> {
    return this.http.post<any>(
      endpoint + 'purchases/generateShippingSticker',
      JSON.stringify({ token: this.auth.getToken(), docId: docId }),
      invoiceOptions
    );
  }

  /**
   * Returns the path of the invoice document
   */
   getSaleInvoice(docId: number): Observable<any> {
    return this.http.post<any>(
      endpoint + 'sales/getInvoicePdfPath',
      JSON.stringify({ token: this.auth.getToken(), docId: docId }),
      invoiceOptions
    );
  }
}
