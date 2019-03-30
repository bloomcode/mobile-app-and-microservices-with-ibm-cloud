import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the RestServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RestServiceProvider {

  constructor(public http: HttpClient) {
    // 'Hello RestServiceProvider Provider'
  }

  registerUser(BackendUrl: string, avatar: any) {
    let headers = {
      'content-type': 'application/json'
    };
    return this.http.post(BackendUrl + '/users', avatar, { headers: headers });
  }

  getUsers(BackendUrl: string) {
    return this.http.get(BackendUrl + '/users');
  }

  getLeaderBoard(BackendUrl: string) {
    return this.http.get(BackendUrl + '/leaderboard', {
      observe: 'response'
    });
  }

  getProducts(BackendUrl: string) {
    return this.http.get(BackendUrl + '/shop/products', {
      observe: 'response'
    });
  }

  buyProduct(BackendUrl: string, product: string, userName: string) {
    let headers = {
      'content-type': 'application/json'
    };
    let data = {
      'name': userName
    }
    return this.http.post(BackendUrl + '/shop/order/' + product, data, { headers: headers });
  }

  addSteps(BackendUrl: string, steps: string, userID: string) {
    let headers = {
      'content-type': 'application/json'
    };
    let data = {
      'steps': steps
    }
    return this.http.put(BackendUrl + '/users/' + userID, data, { headers: headers });
  }

  getUserInfo(BackendUrl: string, userID: string) {
    return this.http.get(BackendUrl + '/users/' + userID, {
      observe: 'response'
    });
  }

  generateAvatar(BackendUrl: string) {
    return this.http.get(BackendUrl + '/users/generate', {
      observe: 'response'
    });
  }
}
