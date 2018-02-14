import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import firebase from 'firebase';
import { ApiServiceProvider } from '../../providers/api-service/api-service';

@IonicPage()
@Component({
  selector: 'page-side-m',
  templateUrl: 'side-m.html',
})
export class SideMPage {
   rootPage :any = 'HomePage'
   fireID: any;
  constructor(public navCtrl: NavController, public navParams: NavParams,
  public api: ApiServiceProvider) {

    firebase.auth().onAuthStateChanged((currentUser) => {
        if (currentUser) {
            console.log("User " + currentUser.uid + " is logged in with " + currentUser.providerId);
            this.fireID = currentUser.uid;
        } else {
            document.querySelector(".tabbar.show-tabbar")['style'].display = 'flex';
            this.navCtrl.setRoot('TabsPage');
        }
    })
  }

  profile(){
    this.navCtrl.push('ProfilePage',{fireID: this.fireID });
  }

  logOut(){
    this.api.logOutStatus(firebase.auth().currentUser.uid).subscribe(response=>{
      console.log(response);

      firebase.auth().signOut();
    });

  }

  workPanel(){
    this.rootPage = "HomePage";
  }
}
