import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class ApiServiceProvider {

  api: string = "https://carlab.azurewebsites.net/";

  done_order: string = "clear_order/";
  get_worker : string = "get_worker/";
  get_order: string = "get_order/";
  create_worker: string = "create_worker";
  worker_state: string = "change_status/";
  update_worker: string = "update_worker/";
  test_pusher: string = "test_message/";
  challenge_order: string = "challenge_order/";
  start_service: string = "start_service/";
  end_service: string= "end_service/";
  logout: string= "logout/"
  wash_service: string = "wash_service/";
  constructor(public http: HttpClient) {  }


  //<!--[Fetch Worker From API]-->//
  startService(order_id: string, now: any){

    return this.http.get( this.api + this.start_service + order_id + "/"+now  );

  }

  //<!--[Fetch Worker From API]-->//
  logOutStatus(fireID: string){

    return this.http.get( this.api + this.logout + fireID   );

  }

  //<!--[Fetch Worker From API]-->//
  endService(order_id: string, now : any){

    return this.http.get( this.api + this.end_service + order_id +"/"+ now );

  }


  startWash(order_id: string, now : any){
    return this.http.get( this.api + this.wash_service + order_id +"/"+ now );
  }

  //<!--[Fetch Worker From API]-->//
  challengeOrder(order_id: string, worker_id: string){

    return this.http.get( this.api + this.challenge_order + order_id + "/" + worker_id );

  }

  //<!--[Fetch Worker From API]-->//

  getWorker(fireID: string){

    return this.http.get( this.api + this.get_worker + fireID  );

  }

  //<!--[Create New Worker]-->//

  createWorker(new_user: object){

    return this.http.post( this.api + this.create_worker, new_user );

  }

  //<!--[Change Worker Status.]-->//

  changeStatus(fireID: string){

    return this.http.get( this.api + this.worker_state + fireID  );

  }

  //<!--[Update Worker.]-->//

  updateWorker(fireID: string, new_user: object){

    return this.http.post( this.api + this.update_worker + fireID, new_user  );

  }

  //<!--[Test Worker.]-->//

  testPusher(){

    return this.http.get( this.api + this.test_pusher );

  }

}
