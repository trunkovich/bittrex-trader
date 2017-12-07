import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { BittrexService } from '../bittrex.service';
import { Market, Order, Ticks } from '../bittrex.model';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/delay';

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BuyComponent implements OnInit {
  coinNameCtrl = new FormControl();
  options: string[] = [];
  filteredOptions$: Observable<string[]>;
  ticks$: Observable<Ticks>;
  selectedMarket: Market;
  order: Order;

  constructor(public bittrex: BittrexService) {}

  ngOnInit() {

    this.bittrex.getMarkets()
      .subscribe(result => {
        this.options = result;
      });

    this.filteredOptions$ = this.coinNameCtrl.valueChanges
      .pipe(
        startWith(null),
        map(val => val ? this.filter(val) : this.options.slice())
      );

    this.ticks$ = this.coinNameCtrl.valueChanges
      .pipe(
        tap(() => this.selectedMarket = null),
        filter(val => !!val && this.options.includes(val)),
        map((val) => this.bittrex.getMarketByCoinName(val)),
        filter(market => !!market),
        tap((market: Market) => this.selectedMarket = market),
        switchMap((market: Market) => this.bittrex.getTicks(market))
      );


  }

  filter(val: string): string[] {
    return this.options.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  buyCoins() {
    if (this.selectedMarket) {
      this.bittrex.buyCoin(this.selectedMarket)
        .subscribe(
          (uuid) => this.controlOrder(uuid),
          (error) => console.error(error)
        );
    }
  }

  controlOrder(uuid) {
    this.bittrex.getOrder(uuid)
      .pipe(
        tap(order => this.order = order),
        switchMap(order => {
          if (order.IsOpen) {
            return Observable.throw('still opened');
          } else {
            return of(order);
          }
        })
      )
      .retryWhen((error) => error.delay(1000).retry(5))
      .subscribe(() => alert('order finished'));
  }
}
