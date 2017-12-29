import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatListModule,
  MatProgressSpinnerModule, MatTableModule,
  MatToolbarModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { BittrexService } from './bittrex.service';
import { appComponents, AppRoutingModule } from './app.routing';
import { NgPipesModule } from 'ngx-pipes';
import { MomentModule } from 'angular2-moment';

import { registerLocaleData } from '@angular/common';
import localeRu from './locales/ru';
import { TradeDetailsComponent } from './currency-info/trade-details/trade-details.component';

registerLocaleData(localeRu, 'ru');


@NgModule({
  declarations: [
    AppComponent,
    ...appComponents
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    NgPipesModule,
    MomentModule,

    MatToolbarModule,
    MatCardModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTableModule,

    AppRoutingModule
  ],
  providers: [
    BittrexService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
