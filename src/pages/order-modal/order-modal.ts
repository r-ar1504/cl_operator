import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams,NavController, LoadingController, AlertController } from 'ionic-angular';
import {
 GoogleMaps,
 GoogleMap,
 GoogleMapsEvent,
 GoogleMapOptions
} from '@ionic-native/google-maps';
import moment from 'moment';
import firebase from 'firebase';
import { Geolocation } from '@ionic-native/geolocation';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { LocalNotifications } from '@ionic-native/local-notifications'
import Pusher from 'pusher-js'


@IonicPage()
@Component({
  selector: 'page-order-modal',
  templateUrl: 'order-modal.html',
})
export class OrderModalPage {

  order: any;
  map: GoogleMap;
  worker = {};
  pusher = new Pusher('f5539bee8f145c88cc57', {
    cluster: 'us2'
  });
  constructor(
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    private googleMaps: GoogleMaps,
    public navCtrl: NavController,
    public geo: Geolocation,
    public api: ApiServiceProvider,
    public alertCtrl: AlertController,
    public localNotifications: LocalNotifications) {
      this.order = this.navParams.get('order');
      this.loadData();
  }

  //<!--Load Current Order Data----------------------------------------//
  loadData()
  {
    let loading = this.loadingCtrl.create({
    content: 'Cargando Información',
    spinner: 'crescent'
    })

    loading.present();
    this.loadMap(this.order);
    this.order.service_date = moment(this.order.service_date).format("D-MMM H:mm A");
    loading.dismiss();
    console.log(this.order);

  }
  //<!--Accept Current Order------------------------------------------//
  acceptOrder()
  {
    let user = firebase.auth().currentUser.uid;
    let order_id = this.order.id;

    // this.getCoordenades();

    this.api.challengeOrder(order_id, user).subscribe(response=>{

      if( (response as any ).code == "2" ){
        let alert = this.alertCtrl.create({
          title: 'Aviso',
          subTitle: "La Orden ha sido tomada por otro operador.",
          buttons: [
          {
            text: 'Volver',
            role: 'cancel',
            handler: data =>{
              this.navCtrl.pop();
            }
          }]
        });

        alert.present();

      }else if((response as any ).code == "1"){
        let order_channel = this.pusher.subscribe('order-'+this.order.id);

        this.localNotifications.schedule({
          id: this.order.id,
          title: 'Recordatorio',
          text: 'La Orden' + this.order.id + "Esta por comenzar",
          at: moment(this.order.service_date).subtract(20,"m").toString(),
        });

        let alert = this.alertCtrl.create({
          title: 'Aviso',
          subTitle: "Se te ha asignado la orden.",
          buttons: [
          {
            text: 'Volver al panel',
            role: 'cancel',
            handler: data =>{

              this.navCtrl.pop();
            }
          }]
        });

        alert.present();

      }else{
        alert("Ha ocurrido un error!");
      }
    });
  }
  //<!--Load Map of the service---------------------------------------//
  loadMap(order)
  {
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

    this.map = GoogleMaps.create("order_map", map_options)
    console.log(this.map);
    this.map.one(GoogleMapsEvent.MAP_READY)
    .then(()=>{
      this.map.addMarker({
        title: "Destino del servicio",
        icon: "blue",
        animation: "DROP",
        position: {
          lat: order.latitude,
          lng: order.longitude
        }
      }).then(marker=>{
        marker.setDraggable(false);
      })
    });
  }
  //<!--Reject Current Order------------------------------------------//
  rejectOrder()
  {
    var user = firebase.auth().currentUser;
    this.navCtrl.pop();
  }

}
