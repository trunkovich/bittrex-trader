import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BittrexService } from '../bittrex.service';
import { Balance } from '../bittrex.model';

@Component({
  selector: 'app-wallets',
  templateUrl: './wallets.component.html',
  styleUrls: ['./wallets.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WalletsComponent implements OnInit {
  balances: Balance[];

  constructor(private bittrex: BittrexService) { }

  ngOnInit() {
    this.bittrex.getBalances()
      .subscribe((balances) => this.balances = balances);
  }

}
