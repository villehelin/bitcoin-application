import { Component } from '@angular/core';
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

  constructor(private bitcoinService: BitcoinService) {}

  ngOnInit() {

    this.bitcoinService.getData()
      .subscribe((data: any[]) => {
        console.log(data);
      });
  }

  searchButton(startdate, enddate){
    console.log("startdate is", startdate);
    console.log("enddate is", enddate);

    this.dateToUnixTime(startdate, enddate)
  }

  dateToUnixTime(startdate, enddate) {
    this.startUnix = new Date(startdate + ' 02:00:00').getTime() / 1000;  // Adding two hours to date to ensure getting data from that day
    this.endUnix = new Date(enddate + ' 02:00:00').getTime() / 1000;  // Adding two hours to date to ensure getting data from that day
    console.log(this.startUnix)
    console.log(this.endUnix)
  }
}
