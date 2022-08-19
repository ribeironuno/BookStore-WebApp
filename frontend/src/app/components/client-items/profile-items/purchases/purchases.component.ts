import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Client } from 'src/app/models/client';
import { ClientPurchase } from 'src/app/models/clientPurchase';
import { ClientRestService } from 'src/app/services/client-rest.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css'],
  providers: [ClientRestService],
})
export class PurchasesComponent implements OnInit {
  @Input() client!: Client;

  //component
  showTable: boolean = true;
  tmpPurchase!: ClientPurchase;
  p: number = 0;

  //table
  purchases!: ClientPurchase[];
  dataSource = new MatTableDataSource<ClientPurchase>(this.purchases);
  displayedColumns = ['code', 'date', 'num', 'total', 'details'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private clientRest: ClientRestService) {}

  ngOnInit(): void {
    this.clientRest.getPurchasesOfActualClient().subscribe((data) => {
      console.log(data);
      
      this.purchases = data;
    });
  }

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  displayTable() {
    this.showTable = true;
  }

  displaySale(purchase: ClientPurchase) {
    this.showTable = false;
    this.tmpPurchase = purchase;
  }
}
