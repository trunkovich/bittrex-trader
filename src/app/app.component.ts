import { Component, OnInit } from '@angular/core';
import { BittrexService } from './bittrex.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public bittrex: BittrexService) {}
}
