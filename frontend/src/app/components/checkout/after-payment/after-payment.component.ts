import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-after-payment',
  templateUrl: './after-payment.component.html',
  styleUrls: ['./after-payment.component.css'],
})
export class AfterPaymentComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private cartService: CartService
  ) {}

  paymentDone!: boolean;

  ngOnInit(): void {
    this.cartService.removeAllCart();
    localStorage.removeItem('cartBooks');
  }
}
