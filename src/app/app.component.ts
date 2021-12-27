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

  searchButton(startdate, enddate) { // function that triggers when button is pressed
    // console.log("startdate is", startdate);
    // console.log("enddate is", enddate);

    this.dateToUnixTime(startdate, enddate); // changes given dates to unix for api

    this.getBitcoinData(this.startUnix, this.endUnix); // calls api for data and when data is get from api calls assingmets function
  }

  dateToUnixTime(startdate, enddate) {
    this.startUnix = new Date(startdate + ' 02:00:00').getTime() / 1000; // Adding two hours to get that day data 
    this.endUnix = new Date(enddate + ' 04:00:00').getTime() / 1000;  // Adding couple hours to date to ensure getting data from that day
    //console.log(this.startUnix)
    //console.log(this.endUnix)
  }

  getBitcoinData(startdate, enddate) {
    this.bitcoinService.getData(startdate, enddate)
    .subscribe((data: any[]) => {
      // console.log(data);
      this.bitcoin = data;
      this.bitcoinLoaded = Promise.resolve(true);

      this.assingments();
      
    });
  }

  assingments() { // contains code for application

    this.days = 0;

    // calculate days in the given range 
    for (let i = 0; i < this.bitcoin.prices.length; i++) { 
      if (this.previousDate != new Date(this.bitcoin.prices[i][0]).toLocaleDateString("fi-FI")) {
        this.previousDate = new Date(this.bitcoin.prices[i][0]).toLocaleDateString("fi-FI");
        //console.log(this.previousDate);
        this.days++;
        //console.log(this.days);
      }
    }

    // if range had less than 90 days api gives data point for every hour so using every 24th point for daily data else api gives daily data
    if (this.days < 90 ) {
      this.x = 24;
    }
    else {
      this.x = 1;
    }

    // A. How many days is the longest bearish (downward) trend within a given date range?
    this.bearish = 0;
    this.maxBearish = 0;


    for (let i = 0; i < this.bitcoin.prices.length - this.x; i = i + this.x) {
      //console.log(i);
      if (this.bitcoin.prices[i][1] > this.bitcoin.prices[i + this.x][1]) { // if tomorrows price is lower than today adding +1 to bearish count 
        this.bearish++;  
      }
      else if (this.bitcoin.prices[i][1] < this.bitcoin.prices[i + this.x][1]) { // if tomorrows price is higher than today reseting bearish and saving bearish value if it is higher than old price
        if (this.bearish > this.maxBearish) {
          // console.log(this.bearish);
          console.log(i);
          this.maxBearish = this.bearish; 
        }
        this.bearish = 0;
      }
    }

    if (this.bearish > this.maxBearish) { // if last bearish value is highest saving that
      this.maxBearish = this.bearish
    }

    if (this.maxBearish === this.days - 1) { // checking if values are only downward for given range
      this.onlyDownward = true;
    }
    else {
      this.onlyDownward = false;
    }

    // B. Which date within a given date range had the highest trading volume?
    this.highestTradingDate = 0;
    this.highestVolume = 0;

    // checking if trading volume is higher than last highest one
    for (let i = 0; i < this.bitcoin.total_volumes.length; i++) {
      if (this.bitcoin.total_volumes[i][1] > this.bitcoin.total_volumes[this.highestTradingDate][1]) {
        this.highestTradingDate = i;
        this.highestVolume = this.bitcoin.total_volumes[i][1]; 
      }
    }

    const date = new Date(this.bitcoin.total_volumes[this.highestTradingDate][0]);
    this.highestTradingDateString = date.toLocaleDateString("fi-FI");

    // C. Scrooge has access to Gyro Gearloose’s newest invention, a time machine. Scrooge
    // wants to use the time machine to profit from bitcoin. The application should be able to tell
    // for a given date range, the best day for buying bitcoin, and the best day for selling the
    // bought bitcoin to maximize profits. If the price only decreases in the date range, your
    // output should indicate that one should not buy (nor sell) bitcoin on any of the days. You
    // don't have to consider any side effects of time travel or how Scrooge's massive purchases
    // would affect the price history.


    this.profit = 0;

    // calculating maximum profit for given date range 
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
