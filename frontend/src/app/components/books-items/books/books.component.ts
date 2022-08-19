import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookRestService } from 'src/app/services/book-rest.service';
import { Book } from 'src/app/models/book';
import { CartService } from 'src/app/services/cart.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DropMenuComponent } from 'src/app/components/books-items/drop-menu/drop-menu.component';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css'],
})
export class BooksComponent implements OnInit {
  books!: Book[];
  searchKey: string = '';
  public filterCategory: any;
  p: number = 0;
  listing = true;
  viewingBook!: Book;

  constructor(
    private rest: BookRestService,
    private route: ActivatedRoute,
    private router: Router,
    private cart: CartService,
    private bottomSheet: MatBottomSheet
  ) {}

  ngOnInit(): void {
    this.getBooks();
    this.cart.search.subscribe((val: any) => {
      this.searchKey = val;
    });
  }

  /**
   * Api call for get books
   */
  getBooks() {
    this.rest.getBooks().subscribe((data: Book[]) => {
      this.books = data;
      this.checkSearchBookFromUrl();
    });
  }

  /**
   * Checks if was attempted to search a book by url
   */
  checkSearchBookFromUrl() {
    let searchIsbn = this.route.snapshot.queryParams['isbn'];

    if (searchIsbn) {
      let indexOfBook = this.indexOfByIsbn(searchIsbn);
      if (indexOfBook != -1) {
        this.showBookDetails(this.books[indexOfBook]);
      }
    }
  }

  /**
   * Returns the index or -1;
   */
  indexOfByIsbn(isbn: string): number {
    let index = -1;
    for (let i = 0; i < this.books.length && index == -1; i++) {
      if (this.books[i].ISBN == isbn) {
        index = i;
      }
    }
    return index;
  }

  openComponentSheetMenu(book: Book) {
    this.bottomSheet.open(DropMenuComponent, {
      data: {
        book: book,
      },
    });
  }

  showBookDetails(book: Book) {
    this.listing = false;
    this.viewingBook = book;
  }

  closeBookDetails() {
    this.listing = true;
  }
}
