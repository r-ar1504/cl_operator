import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import {ApiServiceProvider} from '../../providers/api-service/api-service';
import firebase from 'firebase';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  public user : FormGroup;
  worker = {};
  worker_id: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder,public loadingCtrl: LoadingController, public api: ApiServiceProvider) {

    this.worker_id = this.navParams.get('fireID');
    this.getWorker(this.worker_id);

    this.user = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
    })

  }


  //Fetch Worker Data.

  getWorker(worker_id: string){

    this.api.getWorker(worker_id).subscribe(
    (response) => {
       this.worker = (response as any).worker;

    },
    (error) => { console.log(error); });

  }

  //Fetch Worker Data.

  updateUser(worker_id: string){

    let new_user = {
      email: this.user.get('email').value,
      phone: this.user.get('phone').value
    }

    firebase.auth().currentUser.updateEmail(new_user.email).then(()=>{

      this.api.updateWorker(this.worker_id, new_user).subscribe((response)=>{
        this.getWorker(this.worker_id);
      })

      alert("Se han actualizado tus datos!");
    }).catch((error) =>{
      if(error['message'] == "EMAIL_EXISTS"){
        alert("Lo sentimos, este correo ya esta registrado con otro usuario.");
      }else{
        alert("Lo sentimos, ha ocurrido un error.");
      }
    })
  }


}
