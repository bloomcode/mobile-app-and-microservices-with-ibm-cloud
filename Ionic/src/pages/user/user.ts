import { Component } from '@angular/core';
import { NavController, Avatar } from 'ionic-angular';
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
public BackendUrl: string = "http://184.173.5.249:30000"


  constructor(public navCtrl: NavController, private httpClient: RestServiceProvider, private sanitizer: DomSanitizer) {

    this.httpClient.generateAvatar(this.BackendUrl).subscribe((Avatar) => {
      
      var useravatar = new UserAvatar(Avatar);
      this.displayImage ="data:image/png;base64, "+ useravatar.image;
      this.displayImage.replace('unsafe:','');
      this.httpClient.registerUser(this.BackendUrl, Avatar).subscribe((Response) => {
        this.userName = Response['name']
        this.userFitcoins = Response['fitcoin']
        this.userId = Response['userId']
      
      })
  });

  }


 
}
