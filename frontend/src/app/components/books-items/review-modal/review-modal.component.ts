import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BookRestService } from 'src/app/services/book-rest.service';

@Component({
  selector: 'app-review-modal',
  templateUrl: './review-modal.component.html',
  styleUrls: ['./review-modal.component.css'],
})
export class ReviewModalComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private bookService: BookRestService,
    private dialog: MatDialogRef<ReviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  rate: number = 0;

  showError1 = false;
  showError2 = false;
  showError3 = false;

  ngOnInit(): void {}

  /**
   * Submits a review
   */
  submit(description: string, isbn: number) {
    if (this.rate == 0) {
      this.showError1 = true;
      return;
    }

    if (description.length < 5) {
      this.showError2 = true;
      return;
    }

    this.bookService
      .registrationReview(this.rate, description, this.data.isbn)
      .subscribe(
        (res) => {
          if (res.success == 1) {
            this.dialog.close(true);
          }
        },
        (err) => {
          this.showError1 = true;
          return;
        }
      );
  }

  associateRate(rate: number) {
    this.rate = rate;
  }

  closeError(number: number) {
    switch (number) {
      case 1:
        this.showError1 = false;
        break;
      case 2:
        this.showError2 = false;
        break;
      case 3:
        this.showError3 = false;
        break;
    }
  }
}
