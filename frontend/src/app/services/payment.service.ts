import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutService } from './checkout.service';
import { Sale } from '../models/sale';
import { AuthService } from './auth/auth.service';
import { NgToastService } from 'ng-angular-popup';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  sale!: Sale;

  constructor(
    private http: HttpClient,
    private checkoutService: CheckoutService,
    private auth: AuthService,
    private toast: NgToastService
  ) {}

  /**
   * Creates a sale
   */
  createTempSale(sale: Sale) {
    return this.http.post<Sale>(
      'http://localhost:3000/store/sales/createTempSale',
      sale,
      httpOptions
    );
  }

  /**
   * Make payment and register a sale
   */
  makePayment(sale: Sale) {
    this.sale = sale;
    console.log(this.sale)

    this.createTempSale(this.sale).subscribe(
      (response) => {
        fetch('http://localhost:3000/store/sales/checkoutSession', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': this.auth.getToken(),
          },
          body: JSON.stringify({
            value:
              this.sale.totalValueWithDiscount == 0
                ? this.sale.totalValue! + this.sale.shippingCost
                : this.sale.totalValueWithDiscount + this.sale.shippingCost,
            idSale: response,
          }),
        })
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
            return res.json().then((json) => Promise.reject(json));
          })
          .then(({ url }) => {
            window.location = url;
          })
          .catch((e) => {
            this.toast.error({
              detail: 'Erro no registo da compra',
              summary: 'Algum erro aconteceu ao registar a sua compra',
              duration: 5000,
            });
          });
      },
      (err) => {
        this.toast.error({
          detail: 'Erro no registo da compra',
          summary: 'Algum erro aconteceu ao registar a sua compra',
          duration: 5000,
        });
      }
    );
  }
}
