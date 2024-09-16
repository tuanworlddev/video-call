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
    this.socket = webSocket("wss://1862-2402-800-629c-f724-f4c9-97ab-6195-4daf.ngrok-free.app/ws");
  }

  sendMessage(message: any) {
    this.socket?.next(message);
  }

  getMessages() {
    return this.socket?.asObservable();
  }
}
