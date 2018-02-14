import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { LoadingController, ModalController} from  'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  tabs : any;
  private user : FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private fire: AngularFireAuth, public api: ApiServiceProvider, public loadingCtrl: LoadingController, public facebook: Facebook, public modal: ModalController) {

    // Assign User to Form.
    this.user = this.formBuilder.group({
      name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      role: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required]],
      passw_confirm: ['', [Validators.required]]
    })

    // Check For Logged User.

    firebase.auth().onAuthStateChanged((currentUser) => {
        if (currentUser) {
            console.log("User " + currentUser.uid + " is logged in with " + currentUser.providerId);
            document.querySelector(".tabbar.show-tabbar")['style'].display = 'none';
            this.navCtrl.setRoot('SideMPage', {fireID: currentUser.uid});
        } else {
            console.log("User is logged out");
        }
    });

  }

  //Register A New User Using FormBuilder User Data.

  registerUser(){

    let new_user = {
      name: this.user.get('name').value,
      last_name: this.user.get('last_name').value,
      email: this.user.get('email').value,
      phone: this.user.get('phone').value,
      password: this.user.get('password').value,
      role: this.user.get('role').value,
      passw_confirm: this.user.get('passw_confirm').value,
      fireID: ''
    }

    // Create and Load  Spinner.

    let loading = this.loadingCtrl.create({
      content: 'Creando usuario',
      spinner: 'crescent'
    })
    loading.present();

    // Attempt To Create User.

    this.fire.auth.createUserWithEmailAndPassword(new_user.email, new_user.password).then((response)=>{

      loading.dismiss();

      //Add User Data To API.

      new_user.fireID = response.uid;

      console.log (new_user);

      this.api.createWorker(new_user).subscribe((response)=>{

        console.log(response);

      });


      //New Loading Spinner For Login In.

      let loging = this.loadingCtrl.create({
        content: 'Iniciando Sesión',
        spinner: 'crescent'
      })

      loging.present();


      loging.dismiss();

    }).catch((error)=>{

      //Get Error Code And Show User.

      var ec = error.code;

      if(ec == 'auth/email-already-in-use'){

        loading.dismiss();
        alert('El correo ya se encuentra registrado!')
        return;

      }else if(ec == 'auth/invalid-email'){

        loading.dismiss();
        alert('El correo no es valido!')
        return;

      }else if(ec == 'auth/weak-password'){

        loading.dismiss();
        alert('La contraseña es muy insegura intenta con otra!')
        return;
      }

    });

  }

  //Register Worker Using Facebook API

  registerUsingFacebook(){

    let registerM = this.modal.create('RoleModalPage');
    registerM.present();

  }

}
