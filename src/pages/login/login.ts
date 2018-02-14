import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import firebase from 'firebase';
import { Facebook } from '@ionic-native/facebook';
import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  tabs : any;
  private user : FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder,public facebook: Facebook, private fire: AngularFireAuth, public loadingCtrl: LoadingController){

    this.user = this.formBuilder.group({
       email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    firebase.auth().onAuthStateChanged((currentUser) => {
        if (currentUser) {
            console.log("User " + currentUser.uid + " is logged in with " + currentUser.providerId);
            document.querySelector(".tabbar.show-tabbar")['style'].display = 'none';
            this.navCtrl.setRoot('SideMPage', {fireID: currentUser.uid});
        } else {
            console.log("User is logged out");
        }
    })

  }

  loginWithEmail(){

    let loading = this.loadingCtrl.create({
      content: 'Verificando Credenciales',
      spinner: 'crescent'
    })

    loading.present();

   this.fire.auth.signInWithEmailAndPassword(this.user.get('email').value , this.user.get('password').value).catch((error)=>{

     //<!--Get Error Code And Log In-->

     var ec = error.code;

     if(ec == 'auth/user-not-found'){


       alert('No se encontro al usuario!')
       loading.dismiss();
       console.log(ec)
       return;

     }else if(ec == 'auth/invalid-email'){
       console.log(ec)
       loading.dismiss();
       alert('El correo no es valido!')
       return;

     }else if(ec == 'auth/wrong-password'){
       console.log(ec)
       loading.dismiss();
       alert('Contraseña incorrecta!')
       return;
     }else{
       console.log(ec)
       loading.dismiss();
       alert('Se ha producido un error');
       return;
     }

   });
   loading.dismiss();
  }

  facebookLogin(){
    let loading = this.loadingCtrl.create({
      content: 'Iniciando sesión',
      spinner: 'crescent'
    })

    loading.present();

    this.facebook.login(['email','public_profile', 'user_location'])
    .then(response => {
    const facebookCredential = firebase.auth.FacebookAuthProvider
      .credential(response.authResponse.accessToken);

      firebase.auth().signInWithCredential(facebookCredential)
      .then(success =>{

      });
    }).catch((error) => {
            loading.dismiss();
           alert('Se ha producido un error, intenta otro metodo de registro!')
           return;});

  }


}
