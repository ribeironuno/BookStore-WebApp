import { Component, OnInit, Input } from '@angular/core';
import { ClientSale } from 'src/app/models/clientSale';
import { ClientRestService } from 'src/app/services/client-rest.service';
import { CartBook } from 'src/app/models/cartBook';

@Component({
  selector: 'app-display-sale',
  templateUrl: './display-sale.component.html',
  styleUrls: ['./display-sale.component.css'],
})
export class DisplaySaleComponent implements OnInit {
  @Input() sale!: ClientSale;

  parsedBooks?: CartBook[] = [];

  loading: boolean = false;

  constructor(private client: ClientRestService) {}

  ngOnInit(): void {}

  /**
   * Opens the document
   */

  openDocument() {
    this.loading = true;
    this.client.getPurchaseInvoice(this.sale.purchaseId).subscribe(
      (res) => {
        let domain = 'http://localhost:3000';
        window.open(domain + res, '_blank');
        this.loading = false;
      },
      (err) => {
        this.loading = false;
        console.log(err);
      }
    );
  }
/**
 * Open the shipping stick of a pending request sale
 */
  openShippingSticker() {
    this.loading = true;
    this.client.getShippingSticker(this.sale.purchaseId).subscribe(
      (res) => {
        let domain = 'http://localhost:3000';
        window.open(domain + res, '_blank');
        this.loading = false;
      },
      (err) => {
        this.loading = false;
        console.log(err);
      }
    );
  }
}
