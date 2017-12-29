import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { HistoryOrder, Trade } from '../../bittrex.model';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

@Component({
  selector: 'app-trade-details',
  templateUrl: './trade-details.component.html',
  styleUrls: ['./trade-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TradeDetailsComponent implements OnInit {
  @Input() trade: Trade;

  displayedColumns = ['Closed', 'Opened', 'Type', 'Limit', 'Actual Rate', 'Price', 'Quantity'];
  dataSource: HistoryOrdersDataSource;

  constructor() { }

  ngOnInit() {
    this.dataSource = new HistoryOrdersDataSource(this.trade.orders);
  }

}

export class HistoryOrdersDataSource extends DataSource<any> {
  constructor(private orders: HistoryOrder[]) {
    super();
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<HistoryOrder[]> {
    return of(this.orders);
  }
  disconnect() {}
}
