import { IonicPage, NavController, NavParams, LoadingController, AlertController, ModalController, Platform  } from 'ionic-angular';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { Geolocation } from '@ionic-native/geolocation'
import { Component } from '@angular/core';
import firebase from 'firebase';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { PusherProvider } from '../../providers/pusher/pusher';
import moment from 'moment';
import {
 GoogleMaps,
 GoogleMap,
 GoogleMapsEvent,
 GoogleMapOptions
} from '@ionic-native/google-maps';


@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  working_channel: any;
  worker : any;
  orders : any;
  map1: GoogleMap;
  map2: GoogleMap;
  toggle_active: boolean;
  worker_channel: any;
  order_notification: any;
  constructor(public navCtrl: NavController, private localNotifications: LocalNotifications, public loadingCtrl: LoadingController, public platform: Platform, public navParams: NavParams, public api: ApiServiceProvider, public alertCtrl: AlertController, private geo: Geolocation, public pusher: PusherProvider) {
      this.localNotifications.on('click',(notification, state) =>{

        if (notification.id == 1) {

        } else{
          alert("Not Service");
        }

      });

    //Check Session.

    firebase.auth().onAuthStateChanged((currentUser) => {
      if (currentUser) {
        console.log("User " + currentUser.uid + " is logged in with " + currentUser.providerId);

      } else {

        // this.checkStatus();
        document.querySelector(".tabbar.show-tabbar")['style'].display = 'flex';
        this.navCtrl.setRoot('TabsPage');
      }
    });

    // this.loadMaps();

  }

  //<--Get Current Worker Status(On Change)-------------------------------//
  getStatus(worker_status: any)
  {
      console.log(typeof(worker_status));
      switch(worker_status){
       case("0"):

          this.toggle_active = false;
          this.worker_channel = this.pusher.unsubscribe("worker-" + String(this.worker.fireID));
          console.log(this.worker_channel);
          break;
       case("1"):

          this.toggle_active = true;
          this.subscribeChannel();
          break;

      }
  }

  //<--Execute on Load----------------------------------------------------//
  ionViewDidLoad()
  {
    this.getWorker(firebase.auth().currentUser.uid);
  }

  //<--Execute On Leave---------------------------------------------------//
  ionViewWillEnter()
  {
    this.reloadWorker(firebase.auth().currentUser.uid)
  }

  //<--Open Order Data(Received)------------------------------------------//
  loadOrder(order: any)
  {
    this.navCtrl.push('OrderModalPage', order );
  }

  //<--On Worker Status Change Sub/Unsb from service----------------------//
  subscribeChannel()
  {

    this.worker_channel = this.pusher.subscribe("worker-" + String(this.worker.fireID));
      let subs = this.worker_channel.bind("new-order",(message) =>{

        let alert = this.alertCtrl.create({
          title: 'Ha llegado una Orden Nueva',
          subTitle: "Para ver los detalles pulsa en detalles, si deseas rechazar pulsa en cancelar",
          buttons: [{
            text: 'Ver Mas...',
            handler: data =>{
              let order_data = message;
              console.log(order_data)
              this.localNotifications.clear(1);
              this.loadOrder(order_data);
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: data =>{
              this.localNotifications.clear(1);
            }
          }]
        });

        alert.present();

        this.localNotifications.schedule({
          id: 1,
          title: 'Nueva Orden Disponible',
          text: 'Deseas aceptar?',
          data: message,
          led: 'Ffff'
        })


      });
    console.log(subs);
    console.log(this.worker_channel);

  }

  //<--Reload Worker Data------------------------------------------------//
  reloadWorker(worker_id)
  {

        let loading = this.loadingCtrl.create({
          content: 'Cargando tus datos',
          spinner: 'crescent'
        })

        loading.present();

        this.api.getWorker(worker_id).subscribe(
          (response) => {
            this.worker = (response as any).worker;
             this.orders = (response as any).orders;
             this.loadMaps(this.orders);
             loading.dismiss();
          },
          (error) => { console.log(error);

          loading.dismiss();}
        );

  }

  //<--Check & Change Worker Status-------------------------------------//
  checkStatus()
  {
    firebase.auth().currentUser.uid
    let loading = this.loadingCtrl.create({
      content: 'Actualizando estado',
      spinner: 'crescent'
    })

    loading.present();

    this.api.changeStatus(this.worker.fireID).subscribe(response=>{
      console.log(response);
      this.worker['status'] = (response as any).data;


      this.getStatus(this.worker.status);
      loading.dismiss();
    });

  }

  //<--Get Worker Data--------------------------------------------------//
  getWorker(worker_id: string)
  {

    let loading = this.loadingCtrl.create({
      content: 'Cargando tus datos',
      spinner: 'crescent'
    })

    loading.present();

    this.api.getWorker(worker_id).subscribe(
      (response) => {
         this.worker = (response as any).worker;
         this.getStatus(this.worker.status);

         this.orders = (response as any).orders;
         this.loadMaps(this.orders);
         loading.dismiss();
      },
      (error) => { console.log(error);

      loading.dismiss();}
    );

  }

  //<--Load Every Map For Each Order-----------------------------------//
  loadMaps(orders: any)
  {

    for(let order of orders){

      let map_options : GoogleMapOptions = {
        camera: {
          target: {
              lat: order.latitude,
              lng: order.longitude
          },
          zoom: 18,
          tilt: 30
        }
      }

      let map = GoogleMaps.create("map"+order.id, map_options);

      console.log(map);
      map.one(GoogleMapsEvent.MAP_READY)
      .then(()=>{
        map.addMarker({
          title: "Servicio",
          icon: "red",
          animation: "DROP",
          position: {
            lat: order.latitude,
            lng: order.longitude
          }
        })
      });
    }

  }

  //<--Save Route Start Time------------------------------------------//
  startService(order_id: any)
  {
    let now = moment().format("YYYY-MM-DD h:mm A");
    this.api.startService(order_id, now).subscribe(response=>{
      if ((response as any).result == "ok") {
        this.reloadWorker(firebase.auth().currentUser.uid)
      }
    })
  }

  //<--Save Wash Start Time-------------------------------------------//
  startWash(order_id: any)
  {
    let now = moment().format("YYYY-MM-DD h:mm A");
    this.api.startWash(order_id, now).subscribe(response=>{
      if ((response as any).result == "ok") {
        this.reloadWorker(firebase.auth().currentUser.uid)      }
    })
  }

  //<--Save Wash Start Time & Notify---------------------------------//
  endService(order_id: any)
  {
      let now = moment().format("YYYY-MM-DD h:mm A");
    this.api.endService(order_id, now).subscribe(response=>{
      if ((response as any).result == "ok") {
        this.reloadWorker(firebase.auth().currentUser.uid)  }
    })
  }

}
