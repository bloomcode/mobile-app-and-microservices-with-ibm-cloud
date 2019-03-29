import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {RestServiceProvider} from '../../providers/rest-service/rest-service'
import { UserAvatar } from '../user/user';
import { DomSanitizer } from '@angular/platform-browser';

export class User {
  public name: string;
  public image: string;
  public steps: string;
  
  constructor(name, image, steps) {
    this.name = name
    this.image = image
    this.steps = steps
  }
}

@Component({
  selector: 'page-leaderboard',
  templateUrl: 'leaderboard.html'
})
export class LeaderboardPage {
  public BackendUrl: string = "http://184.173.5.249:30002"
  userList: User[];

  constructor(public navCtrl: NavController,private httpClient: RestServiceProvider,private sanitizer: DomSanitizer) {
    this.httpClient.getLeaderBoard(this.BackendUrl).subscribe((Userdata) => {
     this.userList = [];
         var userJSON = JSON.stringify(Userdata);
         var parsedUserdata = JSON.parse(userJSON);
         for (var i=0;i<parsedUserdata.length;i++) {
          var user = new User((i+1).toString() +". "+ parsedUserdata[i]['name'],"data:image/png;base64, " + parsedUserdata[i]['image'],parsedUserdata[i]['steps']);
          this.userList.push(user);
          console.log(parsedUserdata[i]['name'] )
       }
  });
  
}
}
