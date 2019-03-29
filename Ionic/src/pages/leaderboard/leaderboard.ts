import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
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
  public BackendUrl: string = "http://localhost:8082"
  userList: User[];

  constructor(public navCtrl: NavController, private loadingCtrl: LoadingController,private httpClient: RestServiceProvider,private sanitizer: DomSanitizer) {

  }

  ionViewWillEnter() { 
  let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
   loading.present();
    this.httpClient.getLeaderBoard(this.BackendUrl).subscribe((Userdata) => {
     this.userList = [];
         var userJSON = JSON.stringify(Userdata);
         var parsedUserdata = JSON.parse(userJSON);
        for (var i=0;i<parsedUserdata.length;i++) {
          var user = new User((i+1).toString() +". "+ parsedUserdata[i]['name'],"data:image/png;base64, " + parsedUserdata[i]['image'],parsedUserdata[i]['steps']);
          this.userList.push(user);
          
       }
       loading.dismiss();
  });   
}
}
