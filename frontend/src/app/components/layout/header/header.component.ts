import { Component, OnInit } from '@angular/core';
import { CartBook } from 'src/app/models/cartBook';
import { CartService } from 'src/app/services/cart.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  totalBooks: number = 0;
  userLoggedIn!: string;
  searchTerm!: string;

  constructor(private cart: CartService, private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.getIsUserLoggedMessenger().subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.userLoggedIn = JSON.parse(
          localStorage.getItem('currentUser')!
        ).name;
        this.userLoggedIn = this.userLoggedIn.split(' ')[0];
      }
    });

    //Every time that its updated a book
    this.cart.getBooksEvent().subscribe((books: CartBook[]) => {
      this.totalBooks = books.length;
    });

    //Check if there is books in local storage
    if (localStorage.getItem('cartBooks')) {
      let stringJson: string | null = localStorage.getItem('cartBooks');
      if (stringJson != null) {
        let jsonParsed: CartBook[] = JSON.parse(stringJson);
        this.cart.addBookLocalStorage(jsonParsed);
      }
    }
  }

  /*
   * Search a book by Title, ISBN or Author name
   */
  search(event: any) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.cart.search.next(this.searchTerm);
  }

  /**
   * Logout the atual user
   */
  logout() {
    localStorage.removeItem('currentUser');
    location.reload();
  }
}
