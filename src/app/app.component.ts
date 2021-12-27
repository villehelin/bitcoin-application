import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component } from '@angular/core';
import { runInThisContext } from 'vm';
import { BitcoinService } from './bitcoin.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'bitcoin-application';
  bitcoinLoaded: Promise<boolean>;
  startUnix: number;
  endUnix: number;
  bitcoin: any[];
  days: number;
  previousDate: string;
  x: number;
  bearish: number;
  maxBearish: number;
  onlyDownward: boolean;
  highestVolume: number;
  highestTradingDate: number;
  highestTradingDateString: string;
  profit: number;
  dateToBuy: string;
  dateToSell: string;

  constructor(private bitcoinService: BitcoinService) {}

  ngOnInit() {


  }

  searchButton(startdate, enddate){
    console.log("startdate is", startdate);
    console.log("enddate is", enddate);

    this.dateToUnixTime(startdate, enddate);

    this.getBitcoinData();
  }

  dateToUnixTime(startdate, enddate) {
    this.startUnix = new Date(startdate + ' 02:00:00').getTime() / 1000; // Adding two hours to get that day data 
    this.endUnix = new Date(enddate + ' 04:00:00').getTime() / 1000;  // Adding couple hours to date to ensure getting data from that day
    console.log(this.startUnix)
    console.log(this.endUnix)
  }

  getBitcoinData() {
    this.bitcoinService.getData()
    .subscribe((data: any[]) => {
      console.log(data);
      this.bitcoin = data;

      this.bitcoinLoaded = Promise.resolve(true);

      this.assingments();
      
    });
  }

  assingments() {

    this.days = 0;

    for (let i = 0; i < this.bitcoin.prices.length; i++) {
      if (this.previousDate != new Date(this.bitcoin.prices[i][0]).toLocaleDateString("fi-FI")) {
        this.previousDate = new Date(this.bitcoin.prices[i][0]).toLocaleDateString("fi-FI");
        //console.log(this.previousDate);
        this.days++;
        //console.log(this.days);
      }
    }

    if (this.days < 90 ) {
      this.x = 24;
    }
    else {
      this.x = 1;
    }

    // How many days is the longest bearish (downward) trend within a given date range?
    this.bearish = 0;
    this.maxBearish = 0;


    for (let i = 0; i < this.bitcoin.prices.length - this.x; i = i + this.x) {
      //console.log(i);
      if (this.bitcoin.prices[i][1] > this.bitcoin.prices[i + this.x][1]) {
        this.bearish++;  
      }
      else if (this.bitcoin.prices[i][1] < this.bitcoin.prices[i + this.x][1]) {
        if (this.bearish > this.maxBearish) {
          // console.log(this.bearish);
          // console.log(i);
          this.maxBearish = this.bearish; 
        }
        this.bearish = 0;
      }
    }

    if (this.bearish > this.maxBearish) {
      this.maxBearish = this.bearish
    }

    if (this.maxBearish === this.days - 1) {
      this.onlyDownward = true;
    }
    else {
      this.onlyDownward = false;
    }

    // Which date within a given date range had the highest trading volume?
    this.highestTradingDate = 0;
    this.highestVolume = 0;


    for (let i = 0; i < this.bitcoin.total_volumes.length; i++) {
      if (this.bitcoin.total_volumes[i][1] > this.bitcoin.total_volumes[this.highestTradingDate][1]) {
        this.highestTradingDate = i;
        this.highestVolume = this.bitcoin.total_volumes[i][1]; 
      }
    }

    const date = new Date(this.bitcoin.total_volumes[this.highestTradingDate][0]);
    this.highestTradingDateString = date.toLocaleDateString("fi-FI");

    // Scrooge has access to Gyro Gearloose’s newest invention, a time machine. Scrooge
    // wants to use the time machine to profit from bitcoin. The application should be able to tell
    // for a given date range, the best day for buying bitcoin, and the best day for selling the
    // bought bitcoin to maximize profits. If the price only decreases in the date range, your
    // output should indicate that one should not buy (nor sell) bitcoin on any of the days. You
    // don't have to consider any side effects of time travel or how Scrooge's massive purchases
    // would affect the price history.


    this.profit = 0;

    for (let i = 0; i < this.bitcoin.prices.length; i++) {
      for (let j = i + 1; j < this.bitcoin.prices.length; j++) {
        if (this.bitcoin.prices[j][1] - this.bitcoin.prices[i][1] > this.profit) {
          this.profit = this.bitcoin.prices[j][1] - this.bitcoin.prices[i][1];
          this.dateToBuy = new Date(this.bitcoin.prices[i][0]).toLocaleDateString("fi-FI");
          this.dateToSell = new Date(this.bitcoin.prices[j][0]).toLocaleDateString("fi-FI");
        }
      }
    }

  }

  
}
