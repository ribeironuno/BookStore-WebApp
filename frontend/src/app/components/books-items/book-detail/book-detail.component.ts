import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Book } from 'src/app/models/book';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ReviewModalComponent } from '../review-modal/review-modal.component';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.css'],
})
export class BookDetailComponent implements OnInit {
  @Input() book!: Book;
  @Output('openComponentSheetMenu') openComponentSheetMenu: EventEmitter<any> =
    new EventEmitter();

  p: number = 0;

  constructor(
    public dialog: MatDialog,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  buyNow() {
    this.openComponentSheetMenu.emit(this.book);
  }

  openDialog(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['login'], {
        queryParams: { returnUrl: 'products?isbn=' + this.book.ISBN },
      });
      return;
    }
    const dialogRef = this.dialog.open(ReviewModalComponent, {
      width: '60%',
      height: '50%',
      data: {
        isbn: this.book.ISBN,
      },
    });

    dialogRef.afterClosed().subscribe((success: boolean) => {
      console.log(success);
      if (success) {
        location.href = 'products?isbn=' + this.book.ISBN;
      }
    });
  }

  getBarPercentage(value: number) {
    switch (value) {
      case 1:
        return Number(
          (
            ((this.book.reviews.counters.one +
              this.book.reviews.counters.oneAndHalf) /
              this.book.reviews.counterRate) *
            100
          ).toFixed(2)
        );

      case 2:
        return Number(
          (
            ((this.book.reviews.counters.two +
              this.book.reviews.counters.twoAndHalf) /
              this.book.reviews.counterRate) *
            100
          ).toFixed(2)
        );
      case 3:
        return Number(
          (
            ((this.book.reviews.counters.three +
              this.book.reviews.counters.threeAndHalf) /
              this.book.reviews.counterRate) *
            100
          ).toFixed(2)
        );
      case 4:
        return Number(
          (
            ((this.book.reviews.counters.four +
              this.book.reviews.counters.fourAndHalf) /
              this.book.reviews.counterRate) *
            100
          ).toFixed(2)
        );
      case 5:
        return Number(
          (
            (this.book.reviews.counters.five / this.book.reviews.counterRate) *
            100
          ).toFixed(2)
        );
    }
    return 0;
  }

  /**
   * returns the first name of a name
   */
  getShortedName(name : string) {
    return name.split(' ')[0];
  }
}
