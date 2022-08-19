import { Component, OnInit, Input } from '@angular/core';
import { Client } from 'src/app/models/client';
import { BookRestService } from 'src/app/services/book-rest.service';
import { SaleRequestService } from 'src/app/services/sale-request.service';
import { ProfileComponent } from '../profile/profile.component';
import { CartBook } from 'src/app/models/cartBook';
import { SaleBook } from 'src/app/models/saleBook';
import { DropMenuSaleComponent } from '../drop-menu-sale/drop-menu-sale.component';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { RequestSale } from 'src/app/models/requestSale';
import { books } from 'src/app/models/requestSale';
import { Store } from 'src/app/models/store';
import { StoreRestService } from 'src/app/services/store-rest.service';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-request-sale',
  templateUrl: './request-sale.component.html',
  styleUrls: ['./request-sale.component.css'],
})
export class RequestSaleComponent implements OnInit {
  @Input() client!: Client;
  isbnToSale: string = '';
  books: SaleBook[] = [];
  saledBooks: books[] = [];
  total: number = 0;
  confirmedSale = false;
  store!: Store;

  constructor(
    private profile: ProfileComponent,
    private restBook: BookRestService,
    private restStore: StoreRestService,
    private SaleService: SaleRequestService,
    private bottomSheet: MatBottomSheet,
    private toast: NgToastService
  ) {}

  ngOnInit(): void {
    this.SaleService.getBooksEvent().subscribe((books: SaleBook[]) => {
      this.books = books;
      this.total = this.SaleService.getTotalPrice();
    });

    this.restStore.getStoreInformation().subscribe((store: Store) => {
      this.store = store;
    });
  }

  searchBook() {
    this.restBook.getBookByISBN(this.isbnToSale).subscribe(
      (book) => {
        if (!book) {
          this.toast.error({
            detail: 'Livro não encontrado!',
            summary: 'O livro inserido não foi encontrado',
            duration: 5000,
          });
        }
        this.SaleService.addBook(book);
      },
      (err) => {
        this.toast.error({
          detail: 'Livro não encontrado!',
          summary: 'O livro inserido não foi encontrado',
          duration: 5000,
        });
      }
    );
  }

  openComponentSheetMenu(book: SaleBook) {
    this.bottomSheet.open(DropMenuSaleComponent, {
      data: {
        book: book,
      },
    });
    this.total = this.SaleService.getTotalPrice();
  }

  removeBook(book: SaleBook) {
    this.SaleService.removeBook(book);
  }

  confirmSale() {
    this.saledBooks = this.SaleService.getSaledBooks();
    if (this.saledBooks.length == 0) {
      this.toast.error({
        detail: 'Quantidade inválida!',
        summary: 'Adiciona pelo menos um livro',
        duration: 5000,
      });
    } else {
      this.total = this.SaleService.getTotalPrice();
      let client = {
        nif: String(this.client.personalInformation.nif),
      };
      let requestSale = new RequestSale(client, this.saledBooks, this.total);
      this.SaleService.requestSale(requestSale).subscribe(
        (data) => {
          this.toast.success({
            detail: 'Recebemos o teu pedido!',
            summary: '',
            duration: 5000,
          });
          this.confirmedSale = true;
          localStorage.removeItem('sellBooks');
        },
        (err) => {
          console.log(err);

          this.toast.error({
            detail: 'Ocorreu um erro!',
            summary: 'Não conseguimos processar o pedido',
            duration: 5000,
          });
        }
      );
    }
  }
}
