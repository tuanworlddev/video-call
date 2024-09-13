import { Injectable } from '@angular/core';
import {WebSocketSubject} from "rxjs/internal/observable/dom/WebSocketSubject";
import {webSocket} from "rxjs/webSocket";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket?: WebSocketSubject<any>;

  constructor() {
    this.connect();
  }

  connect() {
    this.socket = webSocket("wss://65c3-2405-4802-605a-1510-545f-727f-1acc-cae1.ngrok-free.app/ws");
  }

  sendMessage(message: any) {
    this.socket?.next(message);
  }

  getMessages() {
    return this.socket?.asObservable();
  }
}
