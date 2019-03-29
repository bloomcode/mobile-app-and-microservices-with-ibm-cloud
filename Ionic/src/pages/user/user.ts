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
public BackendUrl: string = "http://184.173.5.249:30006"


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
        this.userFitcoins = Response['fitcoin'] + " fitcoins"
        this.userId = Response['userId']
        this.displayImage ="data:image/png;base64, "+ useravatar.image;
        this.presentAlert()
      })
  });
  }

  addSteps() {
    let alert = this.alertCtrl.create({
      title: 'Log Steps',
      buttons: [
        {
          text: 'Add', handler: data => {
              var Review = JSON.stringify(data.number);
              console.log(Review)
          }
        }
      ],
      inputs: [
        {
          name: 'number',
          placeholder: 'please enter the number',
        },
      ],
      cssClass: 'alertstar',
      enableBackdropDismiss: false
    });
    alert.present();
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
