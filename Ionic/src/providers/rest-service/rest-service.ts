import { HttpClient, HttpClientModule} from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the RestServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RestServiceProvider {

  constructor(public http: HttpClient) {
    console.log('Hello RestServiceProvider Provider');
  }

registerUser(BackendUrl:string, avatar:any) {
  let headerss = {
  'content-type':'application/json'
};
  return this.http.post(BackendUrl + '/users', avatar, {headers: headerss});
}

getUsers(BackendUrl: string) {
  return this.http.get(BackendUrl + '/users');
}

getLeaderBoard(BackendUrl: string) {
  return this.http.get(BackendUrl + '/leaderboard');
}

addSteps(BackendUrl: string, steps: string, userID: string) {
  let headerss = {
    'content-type':'application/json'
  };
  let data = {
    'steps' : steps
  }
  return this.http.post(BackendUrl + '/users/' + userID, data, {headers: headerss});
}

updateUser(BackendUrl: string, userID: string) {
  return this.http.get(BackendUrl + '/users/' + userID);
}

generateAvatar(BackendUrl: string) {
  let headerss = {'Access-Control-Allow-Origin': '*', 
  'Cache-Control': 'no-cache',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT',
  'Accept':'application/json',
  'content-type':'application/json'
};

  return this.http.get(BackendUrl + '/users/generate');
}



}
