import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { RestServiceProvider } from '../../providers/rest-service/rest-service'
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
  public BackendUrl: string = "http://173.193.99.112:30002"
  userList: User[];

  constructor(public navCtrl: NavController, private loadingCtrl: LoadingController, private httpClient: RestServiceProvider, private sanitizer: DomSanitizer, private alertCtrl: AlertController) {
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    this.httpClient.getLeaderBoard(this.BackendUrl).subscribe((response) => {
      if (response.status == 200) {
        this.userList = [];
      var userJSON = JSON.stringify(response.body);
      var parsedUserdata = JSON.parse(userJSON);
      for (var i = 0; i < parsedUserdata.length; i++) {
        var user = new User((i + 1).toString() + ". " + parsedUserdata[i]['userid'], "data:image/png;base64, " + parsedUserdata[i]['image'], parsedUserdata[i]['steps']+ ' steps');
        this.userList.push(user);
      }
      loading.dismiss();
      } else {
        loading.dismiss()
        this.showError()
      }
    });
  }

  showError() {
    let alert = this.alertCtrl.create({
      title: 'Failure',
      subTitle: 'Connection Error, Kindly try after sometime.',
      buttons: ['Ok']
    });
    alert.present();
  }
}
