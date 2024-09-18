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
    this.socket = webSocket("ws://localhost:8080/ws");
  }

  sendMessage(message: any) {
    this.socket?.next(message);
  }

  getMessages() {
    return this.socket?.asObservable();
  }
}
