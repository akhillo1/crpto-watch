import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

//const RECONNECT_INTERVAL = environment.reconnectInterval;

const WS_ENDPOINT = environment.webSocketUrl;
@Injectable({
  providedIn: 'root'
})
export class DataService {

  private socket:any;
  
  constructor() {
  }

  public connect(onReceiveData: any, onOpenConnection: any): void {

    if (!this.socket || this.socket.closed) {
      // this is where you paste your api key
     
      this.socket = new WebSocket(WS_ENDPOINT);
      this.socket.onopen = onOpenConnection;
      this.socket.onmessage = onReceiveData;
      this.socket.onerror = this.handleReconnect;
    }
  }

  addSubscriptionItems(items: string[]) {
    var subRequest = {
      "action": "SubAdd",
      "subs": items
    };
    this.socket.send(JSON.stringify(subRequest));
  }

  removeSubscriptionItems(items: string[]) {
    var subRequest = {
      "action": "SubRemove",
      "subs": items
    };
    this.socket.send(JSON.stringify(subRequest));
  }

  close() {
    this.socket.close();
    this.socket = undefined;
  }

  sendMessage(msg: any) {
    this.socket.send(msg);
  }

  // Reconnection logic to be handled
  handleReconnect() {

  }

}