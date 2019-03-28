import { Component } from '@angular/core';

import { ShopPage } from '../shop/shop';
import { UserPage } from '../user/user';
import { LeaderboardPage } from '../leaderboard/leaderboard';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = UserPage;
  tab2Root = ShopPage;
  tab3Root = LeaderboardPage;

  constructor() {

  }
}
