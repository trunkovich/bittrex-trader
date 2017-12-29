import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BuyComponent } from './buy/buy.component';
import { WalletsComponent } from './wallets/wallets.component';
import { CurrencyInfoComponent } from './currency-info/currency-info.component';
import { TradeDetailsComponent } from './currency-info/trade-details/trade-details.component';


export const routes: Routes = [
  { path: '', component: BuyComponent },
  { path: 'wallets', component: WalletsComponent },
  { path: 'currency/:currency', component: CurrencyInfoComponent },
  { path: '**', pathMatch: 'full', redirectTo: '' }
];

export const appComponents = [
  BuyComponent,
  WalletsComponent,
  CurrencyInfoComponent,
  TradeDetailsComponent
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
