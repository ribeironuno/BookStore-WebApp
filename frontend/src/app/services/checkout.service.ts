import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Sale } from '../models/sale';
import { Coupon } from '../models/coupon';

const endpoint = 'http://localhost:3000/';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  sale!: Sale;
  cartMessage = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  /**
   * Returns the actual program discount
   */
  getDiscountForEach100Points(): Observable<any> {
    return this.http.get<any[]>(
      endpoint + 'admin/points/getDiscountForEach100Points'
    );
  }

  /**
   * Returns the actual loyalty info
   */
  getLoyaltyProgram(): Observable<any> {
    return this.http.get<any[]>(endpoint + 'admin/points/getLoyaltyProgram');
  }

  /**
   * Returns the actual program discount
   */
  getShippingCost(): Observable<any> {
    return this.http.get<any>(endpoint + 'admin/points/getShippingCost');
  }

  /**
   * Returns the actual program discount
   */
  getStoreInformation(): Observable<any> {
    return this.http.get<any[]>(endpoint + 'store/store/getStore');
  }

  /**
   * Searches for a coupon given a code.
   */
  getCoupon(code: string): Observable<Coupon> {
    return this.http.get<Coupon>(
      endpoint + 'admin/coupons/getCoupon?code=' + code
    );
  }

  createSale(sale: Sale): void {
    this.sale = sale;
    this.cartMessage.next(this.sale);
  }

  /**
   * Returns the event message of sale
   */
  getSale(): Observable<Sale> {
    this.cartMessage.next(this.sale);
    return this.cartMessage.asObservable();
  }

  /**
   * Removes the discount from the sale.
   */
  removePointsDiscount(): void {
    this.sale.totalValueWithDiscount = this.sale.pointsToDiscount = 0;
  }

  /**
   * Applies the points discount
   */
  applyPoints(pointsToDiscount: number, totalValueWithDiscount: number): void {
    this.sale.pointsToDiscount = pointsToDiscount;
    this.sale.totalValueWithDiscount = totalValueWithDiscount;
  }

  /**
   * Associates a coupon discount to the sale
   */
  applyCoupon(
    percentageToDiscount: number,
    totalValueWithDiscount: number
  ): void {
    this.sale.couponPercentage = percentageToDiscount;
  }
}
