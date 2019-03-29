import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import {RestServiceProvider} from '../../providers/rest-service/rest-service'
import { from } from 'rxjs/observable/from';
import { Storage } from '@ionic/storage';

export class Product {
  public item: string;
  public stock: string;
  public coins: string;
  
  constructor(item, stock, coins) {
    this.item = item
    this.stock = stock
    this.coins = coins
  }
}

@Component({
  selector: 'page-shop',
  templateUrl: 'shop.html'
})
export class ShopPage {
  public BackendUrl: string = "http://173.193.99.112:30001"
  productList: Product[];

  constructor(public navCtrl: NavController, private loadingCtrl: LoadingController,private httpClient: RestServiceProvider, public storage: Storage, private alertCtrl: AlertController) {
  }

  ionViewWillEnter() { 
    this.refreshProduct()
  }

  refreshProduct() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
   loading.present();
    this.httpClient.getProducts(this.BackendUrl).subscribe((Productdata) => {
     this.productList = [];
         var productSON = JSON.stringify(Productdata);
         var parsedProductdata = JSON.parse(productSON);
        for (var i=0;i<parsedProductdata.length;i++) {
          var user = new Product(parsedProductdata[i]['item'], parsedProductdata[i]['stock'],parsedProductdata[i]['coins']);
          this.productList.push(user); 
       }
       loading.dismiss();
  }); 
  }


  buyProduct(Product) {
    let loading = this.loadingCtrl.create({
      content: 'Ordering...'
    });
   loading.present();
   this.storage.get('userName').then(userId => {
    this.httpClient.buyProduct(this.BackendUrl, Product.item, userId).subscribe((result) => {
      loading.dismiss()
      if(result['status'] == 'Insufficient fitcoin balance')  {
        let alert = this.alertCtrl.create({
          title: 'Failure',
          subTitle: 'Insufficient fitcoin balance',
          buttons: ['Ok']
        });
        alert.present();
      } else {
        let alert = this.alertCtrl.create({
          title: 'Success',
          subTitle: 'Order Succesfully Placed',
          buttons: ['Ok']
        });
        alert.present();
      }
      }); 
   }
  )
  
  }

  
}
