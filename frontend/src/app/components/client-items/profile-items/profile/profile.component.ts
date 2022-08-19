import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Client } from 'src/app/models/client';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  NUMBER_PERSONAL_INFO = 0;
  NUMBER_PURCHASES = 1;
  NUMBER_SALES = 2;
  NUMBER_REQUEST_SALE = 3;

  client?: Client;
  currentTab: number =
    this.NUMBER_PERSONAL_INFO |
    this.NUMBER_PURCHASES |
    this.NUMBER_SALES |
    this.NUMBER_REQUEST_SALE;

  fixedName!: string;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    //Check if there is a client logged in
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.getActualClient();
    }
    this.showPersonalInformation();
  }

  showPersonalInformation() {
    this.currentTab = this.NUMBER_PERSONAL_INFO;
  }

  showPurchases() {
    this.currentTab = this.NUMBER_PURCHASES;
  }

  showSales() {
    this.currentTab = this.NUMBER_SALES;
  }

  showRequestSale() {
    this.currentTab = this.NUMBER_REQUEST_SALE;
  }

  /**
   * Gets the actual client
   */
  getActualClient() {
    this.auth.getActualClient().subscribe(
      (client) => {
        if (client.personalInformation.nif) {
          this.client = client;
          this.fixedName = client.personalInformation.name;
        }
      },
      (err) => {
        this.router.navigate(['/login']);
      }
    );
  }
}
