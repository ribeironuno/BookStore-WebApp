import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Client } from 'src/app/models/client';
import { ClientSale } from 'src/app/models/clientSale';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ClientRestService } from 'src/app/services/client-rest.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css'],
})
export class SalesComponent implements OnInit {
  @Input() client!: Client;

  //component
  showTable: boolean = true;
  tmpSale!: ClientSale;
  p: number = 0;

  //table
  sales!: ClientSale[];
  dataSource = new MatTableDataSource<ClientSale>(this.sales);
  displayedColumns = ['code', 'date', 'num', 'total', 'status', 'details'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private clientRest: ClientRestService) {}

  ngOnInit(): void {
    this.clientRest.getSalesOfActualClient().subscribe((data) => {
      this.sales = data;
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

  displaySale(sale: ClientSale) {
    this.showTable = false;
    this.tmpSale = sale;
  }
}
