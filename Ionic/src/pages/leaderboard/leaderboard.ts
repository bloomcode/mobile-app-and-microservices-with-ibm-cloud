import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {RestServiceProvider} from '../../providers/rest-service/rest-service'

@Component({
  selector: 'page-leaderboard',
  templateUrl: 'leaderboard.html'
})
export class LeaderboardPage {
  public BackendUrl: string = "http://184.173.5.249:30002"

  constructor(public navCtrl: NavController,private httpClient: RestServiceProvider) {
    this.httpClient.getLeaderBoard(this.BackendUrl).subscribe((userdata) => {
     console.log(userdata)
  });
  
}
}
