import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { CartCheckoutBook } from 'src/app/models/cartCheckoutBook';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Client } from 'src/app/models/client';
import { LoyaltyInfo } from 'src/app/models/loyaltyInfo';
import { Store } from 'src/app/models/store';
import { Sale } from 'src/app/models/sale';
import { AuthService } from 'src/app/services/auth/auth.service';
import { PaymentService } from 'src/app/services/payment.service';
import { NgToastService } from 'ng-angular-popup';

class formAddress {
  public address?: string;
  public city?: string;
  public zip?: string;
}

@Component({
  selector: 'app-confirm-checkout',
  templateUrl: './confirm-checkout.component.html',
  styleUrls: ['./confirm-checkout.component.css'],
})
export class ConfirmCheckoutComponent implements OnInit {
  @Input() newAddress: formAddress;
  @ViewChild('boxFreeShipping') boxFreeShipping!: ElementRef;

  //Shipping info
  STORE = 1;
  CLIENT_ADDRESS = 2;
  OTHER_ADDRESS = 3;

  shippingChosen = -1;
  valueToHaveFreeShipping: number = 0;
  shippingCost!: number;

  //Sale general info
  sale: Sale = new Sale(0, 0, 0, 0, '', {}, false);
  client!: Client;
  books!: CartCheckoutBook[];
  storeInformation!: Store;

  //Discounts
  coupon: string = '';
  valueOfCouponDiscount: number = 0;
  discountForEach100Points: number = 0;

  pointsToBeDiscounted: number = 0;
  valueOfPointsDiscount: number = 0;

  constructor(
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private authService: AuthService,
    private paymentService: PaymentService,
    private toast: NgToastService
  ) {
    this.newAddress = new formAddress();
  }

  async ngOnInit(): Promise<void> {
    this.sale.totalValue = this.cartService.getTotalPrice();

    //gets the info about the actual client
    this.authService.getActualClient().subscribe((client: Client) => {
      this.client = client;
      this.sale.client = {
        nif: this.client.personalInformation.nif,
      };
    });

    //gets the store information
    this.checkoutService.getStoreInformation().subscribe((store: Store) => {
      this.storeInformation = store;
    });

    //gets the loyalty program information
    this.checkoutService.getLoyaltyProgram().subscribe((res: LoyaltyInfo) => {
      this.valueToHaveFreeShipping = res.freeShipPoints;
      this.shippingCost = res.shipCost;
      this.discountForEach100Points = this.sale.discountValuePer100Points =
        res.discountForEach100Points;
    });

    //transforms the books in the correct data and create sale
    this.sale.books = this.cartService.getBooksCheckout();
  }

  /**
   * Returns the sum of total with shipping without discount
   */
  getTotalWithShipping() {
    return Number((this.sale.totalValue! + this.sale.shippingCost).toFixed(2));
  }

  getTotalDiscountedWithShipping() {
    return Number(
      (this.sale.totalValueWithDiscount + this.sale.shippingCost).toFixed(2)
    );
  }

  applyPointsDiscount(): void {
    //if points are too small
    if (this.pointsToBeDiscounted < 100) {
      alert('Os pontos devem ser superiores ou iguals a 100');
      this.pointsToBeDiscounted = 0;
      return;
    }

    //if client does not have sufficient points
    if (this.pointsToBeDiscounted > this.client.loyaltySystem.atualPoints) {
      alert('Os pontos não podem ser superiores aos pontos atuais');
      this.pointsToBeDiscounted = 0;
      return;
    }

    //calculates the discount
    let discount =
      Math.trunc(this.pointsToBeDiscounted / 100) *
      this.discountForEach100Points;
    //rounds to 2 decimal places
    discount = Math.round(discount * 100) / 100;

    //If the points discount exceeds the total, adjusts the points to the minimum
    if (discount > this.sale.totalValue!) {
      let minimumPointsNeeded =
        (this.sale.totalValue! / this.discountForEach100Points) * 100;
      minimumPointsNeeded = Math.trunc(minimumPointsNeeded);

      let tensPart = minimumPointsNeeded % 100;

      /*if the "tens" part are not equal to 0 its need to goes to the next hundred.
          (1232 -> 1300) because the discount is from 100 points in 100 points */
      if (tensPart != 0) {
        minimumPointsNeeded = minimumPointsNeeded + (100 - tensPart); //to complete
      }
      this.pointsToBeDiscounted = minimumPointsNeeded;
      discount = this.sale.totalValue!; //total value
    }

    //if was applied a coupon to the total
    if (this.sale.couponPercentage != 0) {
      if (discount == this.sale.totalValue!) {
        //If the points covers all the price, remove coupon
        this.removeCoupon();
      } else {
        this.applyCoupon();
      }
    }

    this.sale.pointsToDiscount = this.pointsToBeDiscounted;
    this.valueOfPointsDiscount = discount;
    this.sale.totalValueWithDiscount = this.sale.totalValue! - discount;
  }

  applyFreeShippingEvent(event: any): void {
    if (event.target.checked) {
      this.applyFreeShipping();
    } else {
      this.removeFreeShipping();
    }
  }

  applyFreeShipping(): void {
    this.sale.freeShipping = true;
    this.sale.shippingCost = 0;
  }

  removeFreeShipping(): void {
    this.boxFreeShipping.nativeElement.checked = false;
    this.sale.freeShipping = false;
    if (this.shippingChosen != this.STORE) {
      this.sale.shippingCost = this.shippingCost;
    }
  }

  removeDiscount(): void {
    this.pointsToBeDiscounted = 0;
    this.sale.totalValueWithDiscount = this.sale.pointsToDiscount = 0;
    this.sale.couponCode = '';

    //if was applied a coupon to the total
    if (this.sale.couponPercentage != 0) {
      this.applyCoupon();
    }
  }

  applyCoupon(): void {
    if (this.coupon.length == 0) {
      this.toast.error({
        detail: 'Cupão inválido!',
        summary: 'Não inseriu nenhum cupão',
        duration: 5000,
      });
      return;
    }

    if (
      this.sale.pointsToDiscount > 0 &&
      this.sale.totalValueWithDiscount == 0
    ) {
      this.toast.error({
        detail: 'Operação inválida!',
        summary: 'O total com desconto já está a 0',
        duration: 5000,
      });
      return;
    }

    this.checkoutService.getCoupon(this.coupon).subscribe(
      (coupon) => {
        let totalValueWithDiscount = this.sale.totalValueWithDiscount;
        let oldTotal = 0;

        //if there was points applied
        if (
          this.sale.totalValueWithDiscount > 0 &&
          this.sale.totalValueWithDiscount < this.sale.totalValue!
        ) {
          oldTotal = this.sale.totalValueWithDiscount;
          totalValueWithDiscount =
            this.sale.totalValueWithDiscount -
            this.sale.totalValueWithDiscount *
              (coupon.percentageToDiscount / 100);
        } else {
          oldTotal = this.sale.totalValue!;
          totalValueWithDiscount =
            this.sale.totalValue! -
            this.sale.totalValue! * (coupon.percentageToDiscount / 100);
        }
        this.sale.couponCode = this.coupon;
        this.sale.couponPercentage = coupon.percentageToDiscount;
        this.sale.totalValueWithDiscount = Number(
          totalValueWithDiscount.toFixed(2)
        );

        this.valueOfCouponDiscount = Number(
          (oldTotal - this.sale.totalValueWithDiscount).toFixed(2)
        );
      },
      (err) => {
        this.toast.error({
          detail: 'Cupão inválido!',
          summary: 'O cupão que inseriu está expirado ou não existe',
          duration: 5000,
        });
      }
    );
  }

  removeCoupon() {
    this.sale.couponPercentage = 0;
    this.sale.totalValueWithDiscount =
      this.sale.totalValueWithDiscount + this.valueOfCouponDiscount;

    this.coupon = '';
    this.valueOfCouponDiscount = 0;
  }

  choseStoreSipping() {
    this.removeFreeShipping();
    this.sale.shippingType = 'storeAddress';
    this.sale.shippingAddress.address = this.storeInformation.address;
    this.sale.shippingAddress.city = this.storeInformation.city;
    this.sale.shippingAddress.zip = this.storeInformation.zipCode;
    this.sale.freeShipping = false;
    this.shippingChosen = this.STORE;
    this.sale.shippingCost = 0;
  }

  choseMyAddressSipping() {
    this.removeFreeShipping();
    this.sale.shippingType = 'clientAddress';
    this.sale.shippingAddress.address = this.client.personalInformation.address;
    this.sale.shippingAddress.city = this.client.personalInformation.city;
    this.sale.shippingAddress.zip = this.client.personalInformation.zip;

    this.shippingChosen = this.CLIENT_ADDRESS;
    this.sale.shippingCost = this.shippingCost;
  }

  choseOtherAddressSipping() {
    this.removeFreeShipping();
    this.sale.shippingType = 'otherAddress';
    this.shippingChosen = this.OTHER_ADDRESS;
    this.sale.shippingCost = this.shippingCost;
  }

  createSale(): void {
    if (this.shippingChosen == -1) {
      this.toast.error({
        detail: 'Sem tipo de envio',
        summary: 'É necessário escolher um tipo de envio',
        duration: 5000,
      });
      return;
    }
    if (this.shippingChosen == this.OTHER_ADDRESS) {
      if (
        !this.newAddress.address ||
        !this.newAddress.city ||
        !this.newAddress.zip
      ) {
        this.toast.error({
          detail: 'Detalhes de morada invállida',
          summary: 'Há campos não preenchidos na morada',
          duration: 5000,
        });
        return;
      }
      if (!/\d{4}-\d{3}/.test(this.newAddress.zip!)) {
        this.toast.error({
          detail: 'Código postal incorreto',
          summary: 'O Código postal deve ser do tipo XXXX-XXX',
          duration: 5000,
        });
      }

      this.sale.shippingAddress.address = this.newAddress.address;
      this.sale.shippingAddress.city = this.newAddress.city;
      this.sale.shippingAddress.zip = this.newAddress.zip;
    }

    switch (this.shippingChosen) {
      case this.OTHER_ADDRESS:
        this.sale.shippingType = 'otherAddress';
        break;
      case this.CLIENT_ADDRESS:
        this.sale.shippingType = 'clientAddress';
        break;
      case this.STORE:
        this.sale.shippingType = 'storeAddress';
        break;
    }

    console.log(JSON.stringify(this.sale));
  }

  payment(): void {
    if (this.shippingChosen == -1) {
      this.toast.error({
        detail: 'Sem tipo de envio',
        summary: 'É necessário escolher um tipo de envio',
        duration: 5000,
      });
      return;
    }
    if (this.shippingChosen == this.OTHER_ADDRESS) {
      if (
        !this.newAddress.address ||
        !this.newAddress.city ||
        !this.newAddress.zip
      ) {
        this.toast.error({
          detail: 'Detalhes de morada invállida',
          summary: 'Há campos não preenchidos na morada',
          duration: 5000,
        });
        return;
      }
      if (!/\d{4}-\d{3}/.test(this.newAddress.zip!)) {
        this.toast.error({
          detail: 'Código postal incorreto',
          summary: 'O Código postal deve ser do tipo XXXX-XXX',
          duration: 5000,
        });
      }

      this.sale.shippingAddress.address = this.newAddress.address;
      this.sale.shippingAddress.city = this.newAddress.city;
      this.sale.shippingAddress.zip = this.newAddress.zip;
    }

    switch (this.shippingChosen) {
      case this.OTHER_ADDRESS:
        this.sale.shippingType = 'otherAddress';
        break;
      case this.CLIENT_ADDRESS:
        this.sale.shippingType = 'clientAddress';
        break;
      case this.STORE:
        this.sale.shippingType = 'storeAddress';
        break;
    }

    this.paymentService.makePayment(this.sale);
  }
}
