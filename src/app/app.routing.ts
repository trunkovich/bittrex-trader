import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BuyComponent } from './buy/buy.component';
import { OrdersComponent } from './orders/orders.component';


export const routes: Routes = [
  { path: '', component: BuyComponent },
  { path: 'orders', component: OrdersComponent },
  { path: '**', pathMatch: 'full', redirectTo: '' }
];

export const appComponents = [
  BuyComponent,
  OrdersComponent
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
