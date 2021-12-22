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
  startUnix: number;
  endUnix: number;
  bitcoin: any[];
  counter: number;
  bearish: number;
  maxBearish: number;
  highestVolume: number;
  highestTradingDate: number;
  highestTradingDateString: string;

  constructor(private bitcoinService: BitcoinService) {}

  ngOnInit() {

    this.bitcoinService.getData()
      .subscribe((data: any[]) => {
        console.log(data);
        this.bitcoin = data;
      });
  }

  searchButton(startdate, enddate){
    console.log("startdate is", startdate);
    console.log("enddate is", enddate);

    this.dateToUnixTime(startdate, enddate)

    this.counter = 0;
    this.bearish = 0;
    this.maxBearish = 0;

    // How many days is the longest bearish (downward) trend within a given date range?
    for (let i = 0; i < this.bitcoin.prices.length - 1; i++) {
      if (this.bitcoin.prices[i + 1][1] > this.bitcoin.prices[i][1]) {
        if (this.maxBearish < this.bearish) {
          this.maxBearish = this.bearish; 
        }
        this.bearish = 0;
      }
      else if (this.bitcoin.prices[i + 1][1] < this.bitcoin.prices[i][1]) {
        this.bearish++;
      }
    }

    this.highestTradingDate = 0;
    this.highestVolume = 0;


    // Which date within a given date range had the highest trading volume?
    for (let i = 0; i < this.bitcoin.total_volumes.length; i++) {
      if (this.bitcoin.total_volumes[i][1] > this.bitcoin.total_volumes[this.highestTradingDate][1]) {
        this.highestTradingDate = i;
        this.highestVolume = this.bitcoin.total_volumes[i][1]; 
      }
    }

    const date = new Date(this.bitcoin.total_volumes[this.highestTradingDate][0]);
    this.highestTradingDateString = date.toLocaleDateString("fi-FI");
  }

  dateToUnixTime(startdate, enddate) {
    this.startUnix = new Date(startdate + ' 02:00:00').getTime() / 1000;  // Adding two hours to date to ensure getting data from that day
    this.endUnix = new Date(enddate + ' 02:00:00').getTime() / 1000;  // Adding two hours to date to ensure getting data from that day
    console.log(this.startUnix)
    console.log(this.endUnix)
  }

  
}
