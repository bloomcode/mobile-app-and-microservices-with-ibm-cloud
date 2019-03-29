import { Component } from '@angular/core';
import { NavController, Avatar, AlertController, LoadingController } from 'ionic-angular';
import { Pedometer } from '@ionic-native/pedometer/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import {RestServiceProvider} from '../../providers/rest-service/rest-service'
import { t } from '@angular/core/src/render3';
import { DomSanitizer } from '@angular/platform-browser';




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
public userSteps: string;
public userScrollView: string;
public userName: string;
public userId: string;
public BackendUrl: string = "http://173.193.99.112:30000"


  constructor(public navCtrl: NavController, private httpClient: RestServiceProvider, private sanitizer: DomSanitizer, private alertCtrl: AlertController, private loadingCtrl: LoadingController) {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    this.httpClient.generateAvatar(this.BackendUrl).subscribe((Avatar) => {
      var useravatar = new UserAvatar(Avatar);
      this.httpClient.registerUser(this.BackendUrl, Avatar).subscribe((Response) => {
        loading.dismiss();
        this.userName = Response['name']
        this.userFitcoins = Response['fitcoins'] + " fitcoins"
        this.userId = Response['name']
        this.displayImage ="data:image/png;base64, "+ useravatar.image;
        this.presentAlert()
      })
  });
  }

  addSteps() {
    this.httpClient.addSteps(this.BackendUrl, '10', this.userId).subscribe((response) => { 
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
    this.httpClient.updateUser(this.BackendUrl, this.userId).subscribe((resp) => { 
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

  
 
}
