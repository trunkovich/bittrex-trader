export interface BittrexResponse {
  success: boolean;
  message: string;
  result: any;
}

export interface GetMarketResponse extends BittrexResponse {
  result: Market[];
}

export interface GetTickerResponse extends BittrexResponse {
  result: Ticks;
}

export interface GetBalanceResponse extends BittrexResponse {
  result: Balance;
}

export interface GetBalancesResponse extends BittrexResponse {
  result: Balance[];
}

export interface GetOrderResponse extends BittrexResponse {
  result: Order;
}

export interface GetOrdersResponse extends BittrexResponse {
  result: Order[];
}

export interface GetOrdersHistoryResponse extends BittrexResponse {
  result: HistoryOrder[];
}

export interface BuyCoinResponse extends BittrexResponse {
  result: {uuid: string; };
}

export interface Market {
  MarketCurrency: string; //  DOGE
  BaseCurrency: string; //  BTC,
  MarketCurrencyLong: string; //  Dogecoin,
  BaseCurrencyLong: string; //  Bitcoin,
  MinTradeSize: number; //  100.00000000,
  MarketName: string; //  BTC-DOGE,
  IsActive: boolean;
  Created: string; //  2014-02-13T00:00:00
}

export interface Ticks {
  Bid: string;
  Ask: string;
  Last: string;
}

export interface Balance {
  Currency: string; //  BTC,
  Balance: number; //  4.21549076,
  Available: number; //  4.21549076,
  Pending: number; //  0.00000000,
  CryptoAddress: string; //  1MacMr6715hjds342dXuLqXcju6fgwHA31,
  Requested: boolean; //  false,
  uuid: string | null;
}

export interface Order {
  AccountId: string; //  null
  CancelInitiated: boolean; //  false
  Closed: boolean; //  null
  CommissionPaid: number; //  0
  CommissionReserveRemaining: number; //  0.00002474
  CommissionReserved: number; //  0.00002474
  Condition: string; //  "NONE"
  ConditionTarget: string; //  null
  Exchange: string; //  "BTC-MCO"
  ImmediateOrCancel: boolean; //  false
  IsConditional: boolean; //  false
  IsOpen: boolean; //  true
  Limit: number; //  0.00063899
  Opened: string; //  "2017-11-28T10:15:23.757"
  OrderUuid: string; //  "848c11ce-9710-4ef1-8480-32bb6464a030"
  Price: number; //  0
  PricePerUnit: string; //  null
  Quantity: number; //  15.49317596
  QuantityRemaining: number; //  15.49317596
  ReserveRemaining: number; //  0.00989998
  Reserved: number; //  0.00989998
  Sentinel: string; //  "74cd0c19-da0c-4f2b-88fa-0038331762f9"
  Type: string; //  "LIMIT_BUY"
}

export interface HistoryOrder {
  Closed: string; // "2017-12-07T05:33:24.037"
  Commission: number; // 0.00000000;
  Condition: string; //  null;
  ConditionTarget: string; // null;
  Exchange: string; // BTC-LTC;
  ImmediateOrCancel: string; // false;
  IsConditional: boolean; // false;
  Limit: number; // 0.00000001;
  OrderType: string; // LIMIT_BUY;
  OrderUuid: string; // fd97d393-e9b9-4dd1-9dbf-f288fc72a185;
  Price: number; // 0.00000000;
  PricePerUnit: number; // null;
  Quantity: number; // 100000.00000000;
  QuantityRemaining: number; // 100000.00000000;
  TimeStamp: string; // 2014-07-09T04:01:00.667;
}

export interface Trade {
  orders: HistoryOrder[];
  finished: boolean;
  volume: number;
  buyPrice: number;
  profitLoss: number;
  currentProfitLoss: number;
  startDateTime: string;
  endDateTime: string;
  profit: number;
  boughtCoins: number;
  soldCoins: number;
}
