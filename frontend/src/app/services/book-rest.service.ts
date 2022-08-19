import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Book } from '../models/book';
import { GeneralResponse } from '../models/responses/resGeneral';

const endpoint = 'http://localhost:3000/store/books/';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
@Injectable({
  providedIn: 'root',
})
export class BookRestService {
  constructor(private http: HttpClient) {}

  /**
   * GET all books
   */
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(endpoint + 'getAllBooks');
  }

  /**
   * GET a book by the ISBN
   */
  getBookByISBN(ISBN: string): Observable<Book> {
    return this.http.get<Book>(endpoint + 'getBookByISBN/' + ISBN);
  }

  registrationReview(
    rate: number,
    description: string,
    isbn: number
  ): Observable<GeneralResponse> {
    return this.http.post<GeneralResponse>(endpoint + 'reviewRegistration', {
      rate: rate,
      text: description,
      isbn: isbn,
    });
  }
}
