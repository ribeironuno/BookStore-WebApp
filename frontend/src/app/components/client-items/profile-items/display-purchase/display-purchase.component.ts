import { Component, Input, OnInit } from '@angular/core';
import { CartBook } from 'src/app/models/cartBook';
import { ClientPurchase } from 'src/app/models/clientPurchase';
import { ClientRestService } from 'src/app/services/client-rest.service';

@Component({
  selector: 'app-display-purchase',
  templateUrl: './display-purchase.component.html',
  styleUrls: ['./display-purchase.component.css'],
})
export class DisplayPurchaseComponent implements OnInit {
  @Input() purchase!: ClientPurchase;

  parsedBooks?: CartBook[] = [];

  p: number = 0;

  loading: boolean = false;

  constructor(private client: ClientRestService) {}

  ngOnInit(): void {
    //For each book adds a CartBook that has >0 quantity
    this.purchase.books.forEach((book) => {
      for (let condition in book.quantity) {
        if (book.quantity[condition] > 0) {
          this.parsedBooks?.push(
            new CartBook(
              book.title,
              book.isbn,
              this.getPortugueseCondition(condition),
              book.quantity[condition],
              book.price[condition],
              book.price[condition] * book.quantity[condition],
              book.imageBook.staticUrl
            )
          );
        }
      }
    });
  }

  /**
   * Opens the document
   */
  openDocument() {
    this.loading = true;
    this.client.getSaleInvoice(this.purchase.salesId).subscribe(
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
   * Given a english conditions return the portuguese version
   */
  getPortugueseCondition(condition: string): string {
    switch (condition) {
      case 'new':
        return 'Novo';

      case 'excellent':
        return 'Excelente';

      case 'good':
        return 'Bom';

      case 'medium':
        return 'Médio';

      case 'bad':
        return 'Mau';

      default:
        return '';
    }
  }
}
