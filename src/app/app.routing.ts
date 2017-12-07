import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BuyComponent } from './buy/buy.component';
import { WalletsComponent } from './wallets/wallets.component';


export const routes: Routes = [
  { path: '', component: BuyComponent },
  { path: 'wallets', component: WalletsComponent },
  { path: '**', pathMatch: 'full', redirectTo: '' }
];

export const appComponents = [
  BuyComponent,
  WalletsComponent
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
