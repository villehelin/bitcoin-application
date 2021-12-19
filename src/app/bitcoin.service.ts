import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BitcoinService {

  constructor(private http: HttpClient) { }

  getData() {
    return this.http.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=1577836800&to=1609376400');
  }
}
