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
  Balance, BittrexResponse, BuyCoinResponse, GetBalanceResponse, GetBalancesResponse, GetMarketResponse, GetOrderResponse,
  GetOrdersHistoryResponse,
  GetOrdersResponse,
  GetTickerResponse, HistoryOrder, Market, Order,
  Ticks, Trade
} from './bittrex.model';
import { ApiKey, ApiPrivate } from '../config';
import { timer } from 'rxjs/observable/timer';
import { forkJoin } from 'rxjs/observable/forkJoin';

export const API_URL = 'https://bittrex.com/api/v1.1';

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
  }

  secureRequest(method: string, url: string, extra: {} = {}) {
    const apikey = ApiKey;
    const apisecret = ApiPrivate;
    const nonce = (new Date()).getTime().toString();
    let signUrl = `${url}?`;
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
    return this.getBalance('BTC')
      .pipe(
        map((btcBalance: Balance) => btcBalance.Available)
      );
  }

  getBalance(currency: string): Observable<Balance> {
    return this.secureRequest('get', `${API_URL}/account/getbalance`, {currency})
      .pipe(
        filter((response: GetBalanceResponse) => response.success),
        map((response: GetBalanceResponse) => response.result),
      );
  }

  getBalances(): Observable<any> {
    return this.secureRequest('get', `${API_URL}/account/getbalances`)
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
    return this.http.get(`${API_URL}/public/getmarkets`)
      .pipe(
        filter((response: GetMarketResponse) => response.success),
        map((response: GetMarketResponse) => response.result),
        map((markets: Market[]) => _.filter(markets, market => market.BaseCurrency === 'BTC')),
        tap((markets: Market[]) => _.each(markets, market => this.marketsByCoinName[market.MarketCurrency] = market)),
        map((markets: Market[]) => _.map(markets, market => market.MarketCurrency))
      );
  }

  getTicks(market: Market): Observable<Ticks> {
    return this.http.get(`${API_URL}/public/getticker`, {
        params: {market: market.MarketName}
      })
      .pipe(
        filter((response: GetTickerResponse) => response.success),
        map((response: GetTickerResponse) => response.result),
        tap((ticks: Ticks) => this.ticksByCoinName[market.MarketCurrency] = ticks)
      );
  }

  sellCoin(market: Market, quantity: number, rate: number): Observable<any> {
    return this.secureRequest(
      'get',
      `${API_URL}/market/selllimit`,
      {market: market.MarketName, quantity, rate}
    );
  }

  buyCoin(market: Market): Observable<any> {
    if (this.ticksByCoinName[market.MarketCurrency]) {
      return of(this.ticksByCoinName[market.MarketCurrency])
        .pipe(
          map((ticks: Ticks) => ticks.Last),
          map((tick: string) => parseFloat(tick)),
          map((tick: number) => tick * 1.05),
          switchMap((price: number) => {
            return this.secureRequest(
              'get',
              `${API_URL}/market/buylimit`,
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
    return this.secureRequest('get', `${API_URL}/account/getorder`, {uuid})
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

  getOpenOrders(market: string): Observable<Order[]> {
    return this.secureRequest('get', `${API_URL}/market/getopenorders`, {market})
      .pipe(
        map((response: GetOrdersResponse) => response.result)
      );
  }

  getOrdersHistory(market: string): Observable<HistoryOrder[]> {
    return this.secureRequest('get', `${API_URL}/account/getorderhistory`, {market})
      .pipe(
        map((response: GetOrdersHistoryResponse) => response.result)
      );
  }

  getTrades(market: string): Observable<Trade[]> {
    return this.getOrdersHistory(market).pipe(
      map((orders: HistoryOrder[]) => _.reverse(orders)),
      map((orders: HistoryOrder[]) => {
        const trades: Trade[] = [];
        _.each(orders, (order: HistoryOrder, index: number) => {
          let trade: Trade;
          if (order.OrderType === 'LIMIT_BUY' && (index === 0 || orders[index - 1].OrderType !== 'LIMIT_BUY')) {
            trade = {
              orders: [order],
              finished: false,
              volume: order.Price,
              buyPrice: order.Price / (order.Quantity - order.QuantityRemaining),
              profitLoss: 0,
              startDateTime: order.Closed,
              endDateTime: null,
              profit: 0,
              boughtCoins: order.Quantity - order.QuantityRemaining,
              soldCoins: 0,
              currentProfitLoss: 0
            };
          } else {
            trade = trades.pop();
            const filled1 = order.Quantity - order.QuantityRemaining;
            trade.orders.unshift(order);
            if (order.OrderType === 'LIMIT_BUY') {
              trade.volume += order.Price;
              const prOrder = orders[index - 1];
              const vol = order.Price + prOrder.Price;
              const filled2 = prOrder.Quantity - prOrder.QuantityRemaining;
              trade.buyPrice = vol / (filled1 + filled2);
              trade.boughtCoins += filled1;
            } else {
              trade.profit += order.Price - order.Commission;
              trade.soldCoins += filled1;
              if (index === (orders.length - 1) || orders[index + 1].OrderType !== 'LIMIT_SELL') {
                trade.finished = trade.soldCoins.toFixed(3) === trade.boughtCoins.toFixed(3);
                trade.profitLoss = trade.profit / (trade.volume * (trade.soldCoins / trade.boughtCoins));
                trade.endDateTime = trade.finished ? order.Closed : null;
              }
            }
          }
          trades.push(trade);
        });
        return _.reverse(trades);
      })
    );
  }

  putSellOrders(market: Market) {
    return this.getOrdersHistory(market.MarketName)
      .pipe(
        map((orders: HistoryOrder[]) => orders[0]),
        switchMap((order: HistoryOrder) => {
          const price = order.PricePerUnit;
          let coins = order.Quantity;
          const price1 = price * 1.03;
          const coins1 = coins * 0.2;
          coins -= coins1;
          const price2 = price * 1.04;
          const coins2 = coins * 0.3;
          coins -= coins2;
          // const price3 = price * 1.04;
          // const coins3 = coins;
          return forkJoin([
            this.sellCoin(market, coins1, price1),
            this.sellCoin(market, coins2, price2),
            // this.sellCoin(market, coins3, price3)
          ]);
        })
      );
  }

  cancelOrder(uuid: string) {
    return this.secureRequest('get', `${API_URL}/market/cancel`, {uuid})
      .pipe(
        map((response: BittrexResponse) => response.result)
      );
  }

}
