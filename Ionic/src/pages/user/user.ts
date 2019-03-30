import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
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
        this.showError()
      }
    });
  }

  addSteps() {
    this.httpClient.addSteps(this.BackendUrl, '10', this.userName).subscribe((response) => {
      let alert = this.alertCtrl.create({
        title: 'Success',
        subTitle: 'We have added 10 steps to your account',
        buttons: ['Cool']
      });
      alert.present();
      this.updateUserDetails();
    });
  }

  updateUserDetails() {
    this.httpClient.updateUser(this.BackendUrl, this.userName).subscribe((resp) => {
      console.log('vittal' + JSON.stringify(resp))
      this.userFitcoins = resp[0]['fitcoins'] + " fitcoins"
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
