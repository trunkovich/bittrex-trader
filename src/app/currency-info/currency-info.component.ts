import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { BittrexService } from '../bittrex.service';
import { Balance, HistoryOrder, Market, Order, Trade } from '../bittrex.model';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { of } from 'rxjs/observable/of';
import { Observable } from 'rxjs/Observable';
import { DataSource } from '@angular/cdk/collections';

@Component({
  selector: 'app-currency-info',
  templateUrl: './currency-info.component.html',
  styleUrls: ['./currency-info.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CurrencyInfoComponent implements OnInit {
  currencyName: string;
  market: Market;
  balance: Balance;
  openOrders: Order[];
  trades: Trade[];
  loading: boolean;

  constructor(private route: ActivatedRoute, private bittrex: BittrexService) { }

  ngOnInit() {
    this.loading = true;
    this.route.params.pipe(
      map(params => params.currency),
      tap(currency => this.currencyName = currency),
      switchMap(currency => {
        let obs;
        if (!this.bittrex.getMarketByCoinName(currency)) {
          obs = this.bittrex.getMarkets();
        } else {
          obs = of(1);
        }
        return obs.pipe(
          map(() => {
            return {
              currency: currency,
              market: this.bittrex.getMarketByCoinName(currency)
            };
          })
        );
      }),
      switchMap(({currency, market}: {currency: string; market: Market}) => {
        this.market = market;
        return forkJoin([
          this.bittrex.getBalance(currency),
          this.bittrex.getOpenOrders(market.MarketName),
          this.bittrex.getTrades(market.MarketName)
        ]).pipe(
          map((results: any) => {
            const balance: Balance = results[0];
            const openOrders: Order[] = results[1];
            const trades: Trade[] = results[2];
            return { balance, openOrders, trades };
          })
        );
      })
    )
      .subscribe(({balance, openOrders, trades}) => {
        this.balance = balance;
        this.openOrders = openOrders;
        this.trades = trades;
        this.loading = false;
        console.log(trades);
      });
  }

  putSellOrders() {
    this.bittrex.putSellOrders(this.market)
      .subscribe((data) => {
        console.log(data);
      });
  }

}
