import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';

@Injectable()
export class PusherProvider {

  pusher = new Pusher('f5539bee8f145c88cc57', {
    cluster: 'us2'
  });

  constructor() {

  }

  subscribe(channel_name: string){

    return this.pusher.subscribe(channel_name);

  }

  unsubscribe(channel_name: string){

    return this.pusher.unsubscribe(channel_name);


  }

}
