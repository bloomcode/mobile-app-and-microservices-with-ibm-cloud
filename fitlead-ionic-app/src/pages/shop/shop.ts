import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { RestServiceProvider } from '../../providers/rest-service/rest-service'
import { Storage } from '@ionic/storage';
import { ConfigUrls } from '../user/user';

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
  public BackendUrl: string = ConfigUrls.shopBackendUrl
  productList: Product[];

  constructor(public navCtrl: NavController, private loadingCtrl: LoadingController, private httpClient: RestServiceProvider, public storage: Storage, private alertCtrl: AlertController) {
  }

  ionViewWillEnter() {
    this.refreshProducts()
  }

  refreshProducts() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    this.httpClient.getProducts(this.BackendUrl).subscribe((response) => {
      if (response.status == 200) {
        this.productList = [];
        var productSON = JSON.stringify(response.body);
        var parsedProductdata = JSON.parse(productSON);
        for (var i = 0; i < parsedProductdata.length; i++) {
          var user = new Product(parsedProductdata[i]['item'], parsedProductdata[i]['stock'] + " left", parsedProductdata[i]['coins'] + " fitcoins");
          this.productList.push(user)
        }
        loading.dismiss()
      } else {
        loading.dismiss()
        this.showError()
      }
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
        if (result['status'] == 'Insufficient fitcoin balance') {
          this.showFailureAlert()
        } else {
          this.showSuccessAlert()
        }
      });
    });
  }

  showSuccessAlert() {
    let alert = this.alertCtrl.create({
      title: 'Success',
      subTitle: 'Order successfully placed',
      buttons: [{
        text: 'Ok',
        handler: () => {
          this.refreshProducts();
        }
      }]
    });
    alert.present();
  }

  showFailureAlert() {
    let alert = this.alertCtrl.create({
      title: 'Failure',
      subTitle: 'Insufficient fitcoin balance',
      buttons: ['Ok']
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
