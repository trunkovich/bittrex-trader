import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { HmacSHA512 } from 'crypto-js';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/throw';
import { interval } from 'rxjs/observable/interval';

import {
  Balance, BuyCoinResponse, GetBalanceResponse, GetBalancesResponse, GetMarketResponse, GetOrderResponse, GetTickerResponse, Market,
  Ticks
} from './bittrex.model';
import { ApiKey, ApiPrivate } from '../config';
import { timer } from 'rxjs/observable/timer';

@Injectable()
export class BittrexService {
  marketsByCoinName: {[key: string]: Market} = {};
  ticksByCoinName: {[key: string]: Ticks} = {};
  public btcBalance: number;

  constructor(private http: HttpClient) {
    timer(0, 30000)
      .pipe(
        switchMap(() => this.getBtcAmount())
      )
      .subscribe((balance: number) => this.btcBalance = balance);

    // this.getOrder('848c11ce-9710-4ef1-8480-32bb6464a030');
  }

  secureRequest(method: string, url: string, extra: {} = {}) {
    const apikey = ApiKey;
    const apisecret = ApiPrivate;
    const nonce = (new Date()).getTime().toString();
    let signUrl = `${url}?`; // `https://bittrex.com/api/v1.1/account/getbalances?apikey=${apikey}&nonce=${nonce}`;
    const params = _.merge(extra, {apikey, nonce});
    _.each(_.keys(params), (key, i) => {
      const value = params[key];
      signUrl += `${key}=${value}`;
      if (i < _.keys(params).length - 1) {
        signUrl += '&';
      }
    });
    const apisign = HmacSHA512(signUrl, apisecret).toString();

    return this.http.request(method, url, {
      params,
      headers: {apisign}
    });
  }

  getBtcAmount(): Observable<number> {
    return this.secureRequest('get', 'https://bittrex.com/api/v1.1/account/getbalance', {currency: 'BTC'})
      .pipe(
        filter((response: GetBalanceResponse) => response.success),
        map((response: GetBalanceResponse) => response.result),
        map((btcBalance: Balance) => btcBalance.Available)
      );
  }

  getBalances(): Observable<any> {
    return this.secureRequest('get', 'https://bittrex.com/api/v1.1/account/getbalances')
      .pipe(
        filter((response: GetBalancesResponse) => response.success),
        map((response: GetBalancesResponse) => response.result),
        map(balances => _.filter(balances, (balance: Balance) => balance.Balance))
      );
  }

  updateBtcAmount() {
    this.getBtcAmount()
      .subscribe((balance) => this.btcBalance = balance);
  }

  getMarkets(): Observable<string[]> {
    return this.http.get('https://bittrex.com/api/v1.1/public/getmarkets')
      .pipe(
        filter((response: GetMarketResponse) => response.success),
        map((response: GetMarketResponse) => response.result),
        map((markets: Market[]) => _.filter(markets, market => market.BaseCurrency === 'BTC')),
        tap((markets: Market[]) => _.each(markets, market => this.marketsByCoinName[market.MarketCurrency] = market)),
        map((markets: Market[]) => _.map(markets, market => market.MarketCurrency))
      );
  }

  getTicks(market: Market): Observable<Ticks> {
    return this.http.get('https://bittrex.com/api/v1.1/public/getticker', {
        params: {market: market.MarketName}
      })
      .pipe(
        filter((response: GetTickerResponse) => response.success),
        map((response: GetTickerResponse) => response.result),
        tap((ticks: Ticks) => this.ticksByCoinName[market.MarketCurrency] = ticks)
      );
  }

  buyCoin(market: Market): Observable<any> {
    if (this.ticksByCoinName[market.MarketCurrency]) {
      return of(this.ticksByCoinName[market.MarketCurrency])
        .pipe(
          map((ticks: Ticks) => ticks.Last),
          map((tick: string) => parseFloat(tick)),
          map((tick: number) => tick * 1.1),
          switchMap((price: number) => {
            return this.secureRequest(
              'get',
              'https://bittrex.com/api/v1.1/market/buylimit',
              {market: market.MarketName, quantity: (this.btcBalance * 0.99) / price, rate: price}
              );
          }),
          map((response: BuyCoinResponse) => {
            if (response.success) {
              return response.result.uuid;
            } else {
              throw(response.message);
            }
          }),
        );
    } else {
      return Observable.throw(new Error('Can\'t find ticks for currency'));
    }
  }

  getOrder(uuid: string) {
    return this.secureRequest('get', 'https://bittrex.com/api/v1.1/account/getorder', {uuid})
      .pipe(
        map((response: GetOrderResponse) => response.result)
      );
  }

  getMarketByCoinName(name: string): Market | null {
    if (name && this.marketsByCoinName[name]) {
      return this.marketsByCoinName[name];
    } else {
      return null;
    }
  }

}
