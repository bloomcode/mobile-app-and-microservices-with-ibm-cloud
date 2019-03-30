import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading } from 'ionic-angular';
import { RestServiceProvider } from '../../providers/rest-service/rest-service'
import { DomSanitizer } from '@angular/platform-browser';
import { Storage, IonicStorageModule } from '@ionic/storage';

export class UserAvatar {
  public name: string;
  public image: string;

  constructor(response: Object) {
    this.image = response['image']
    this.name = response['name']
  }
}

@Component({
  selector: 'page-user',
  templateUrl: 'user.html'
})
export class UserPage {

  public displayImage: string;
  public userFitcoins: string;
  public userName: string;
  public BackendUrl: string = "http://173.193.99.112:30000"


  constructor(public navCtrl: NavController, private httpClient: RestServiceProvider, private sanitizer: DomSanitizer, private alertCtrl: AlertController, private loadingCtrl: LoadingController, public storage: Storage) {
  }

  ionViewWillEnter() {
    this.storage.get('userName').then(userId => {
      if (userId == null) {
        // Fresh User
        this.registerUser()
      } else {
        // Returning User
        this.updateUserDetails(userId, true)
      }
    })
  }

  addSteps() {
    this.httpClient.addSteps(this.BackendUrl, '10', this.userName).subscribe((response) => {
      let alert = this.alertCtrl.create({
        title: 'Success',
        subTitle: 'We have added 10 steps to your account',
        buttons: ['Cool']
      });
      alert.present();
      this.updateUserDetails(this.userName, false);
    });
  }

  registerUser() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    this.httpClient.generateAvatar(this.BackendUrl).subscribe((response) => {
      if (response.status == 200) {
        var useravatar = new UserAvatar(response.body);
        this.httpClient.registerUser(this.BackendUrl, response.body).subscribe((Response) => {
          loading.dismiss();
          this.userName = Response['name']
          this.storage.set('userName', this.userName);
          this.userFitcoins = Response['fitcoins'] + " fitcoins"
          this.displayImage = "data:image/png;base64, " + useravatar.image;
          this.presentAlert()
        })
      } else {
        loading.present()
        this.showError()
      }
    });
  }

  updateUserDetails(userName, showIndicator) {
    var loading: Loading;
    if(showIndicator) {
      loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      loading.present();
    }
    this.httpClient.getUserInfo(this.BackendUrl, userName).subscribe((response) => {
      if (response.status == 200) {
        this.userFitcoins = response.body[0]['fitcoins'] + " fitcoins"
        this.userName = response.body[0]['userid']
        this.displayImage = "data:image/png;base64, " + response.body[0].image;
        if(showIndicator) {
          loading.dismiss()
        }
      } else {
        if(showIndicator) {
          loading.dismiss()
        }
        this.showError()
      }
    });
  }

  presentAlert() {
    let alert = this.alertCtrl.create({
      title: 'Hi, ' + this.userName,
      subTitle: 'You were enrolled and given this random name and avatar.',
      buttons: ['Cool']
    });
    alert.present();
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
