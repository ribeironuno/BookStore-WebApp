import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client } from 'src/app/models/client';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

const endpoint = 'http://localhost:3000/store/';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  jwtHelper: JwtHelperService = new JwtHelperService();
  constructor(private http: HttpClient) {}

  isUserLoggedMessenger = new BehaviorSubject<boolean>(this.isLoggedIn());

  /**
   * Login a client and return a token
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(
      endpoint + 'auth/login',
      JSON.stringify({ email, password }),
      httpOptions
    );
  }

  /**
   * Checks if the user is logged in
   */
  isLoggedIn(): boolean {
    if (localStorage.getItem('currentUser')) {
      let token = JSON.parse(localStorage.getItem('currentUser')!).token;
      return !this.jwtHelper.isTokenExpired(token);
    }
    return false;
  }

  /**
   * Gets the token
   */
  getToken(): string {
    if (localStorage.getItem('currentUser')) {
      let token = JSON.parse(localStorage.getItem('currentUser')!).token;
      return token;
    }
    return '';
  }

  /**
   * Logs out
   */
  logout() {
    localStorage.removeItem('currentUser');
    this.isUserLoggedMessenger.next(false);
  }

  /**
   * Notify messenger of login that user logged in
   */
  loggedIn() {
    this.isUserLoggedMessenger.next(true);
  }

  /**
   * Gets the actual client by the token
   */
  getActualClient(): Observable<Client> {
    return this.http.post<Client>(
      endpoint + 'client/getClientByToken',
      JSON.stringify({ token: this.getToken() }),
      httpOptions
    );
  }

  /**
   * Returns the messenger
   */
  getIsUserLoggedMessenger() {
    return this.isUserLoggedMessenger.asObservable();
  }
}
