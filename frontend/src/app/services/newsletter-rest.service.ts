import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NewsletterSubscriber } from '../models/client';

const endpoint = 'http://localhost:3000/store/newsletter/';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class NewsletterRestService {
  constructor(private http: HttpClient) {}

  /*
   * Registes a new client to the newsletter list
   */
  subscribeNewsletter(
    newsletterSubscriber: NewsletterSubscriber
  ): Observable<any> {
    return this.http.post<NewsletterSubscriber>(
      endpoint + 'subscribe',
      newsletterSubscriber,
      httpOptions
    );
  }

  unsubscribeNewsletter(email: String): Observable<any> {
    let httpOptionsDelete = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        email: email,
      },
    };
    return this.http.delete<any>(endpoint + 'unsubscribe', httpOptionsDelete);
  }
}
