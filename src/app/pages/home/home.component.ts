import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NavbarComponent} from "../../components/navbar/navbar.component";
import {WebrtcService} from "../../services/webrtc.service";
import {VideoCallComponent} from "../../components/video-call/video-call.component";
import {HeaderComponent} from "../../components/header/header.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    VideoCallComponent,
    HeaderComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
