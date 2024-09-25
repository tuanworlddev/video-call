import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {WebrtcService} from "../../services/webrtc.service";
import {CountryService} from "../../services/country.service";
import {Country} from "../../interfaces/country";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {WebsocketService} from "../../services/websocket.service";
import {Message} from "../../interfaces/message";
import {Filter} from "../../interfaces/filter";
import {FilterService} from "../../services/filter.service";

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './video-call.component.html',
  styleUrl: './video-call.component.scss'
})
export class VideoCallComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('localVideo') localVideo?: ElementRef;
  @ViewChild('remoteVideo') remoteVideo?: ElementRef;

  private receiverId: string | null = null;
  private currentDataChannel: RTCDataChannel | null = null;
  protected isStarted = false;
  protected isWaitingLocalVideo = true;
  protected isWaitingRemoteVideo = false;
  protected isModalOpen = false;
  protected currenCountry?: Country;
  protected countries: Country[] = [];
  protected filterCountries: Country[] = [];
  protected countUser: number = 0;
  protected messages: Message[] =[];
  protected messageInput: string = '';
  protected filters: Filter[] = [];
  protected currentFilter?: Filter;
  protected receiverFilter?: Filter;

  constructor(
    private webrtcService: WebrtcService,
    private countryService: CountryService,
    private websocketService: WebsocketService,
    private filterService: FilterService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnDestroy(): void {
    if (this.isStarted) {
      this.stopCall();
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: any) {
    if (this.isStarted) {
      this.stopCall();
    }
  }

  ngOnInit(): void {
    this.handleMessage();
    this.countryService.getAllCountries().subscribe(countries => {
      this.countries = countries;
      this.filterCountries = this.countries;
      this.countryService.getCurrentLocation().subscribe(location => {
        this.currenCountry = countries.find(country => country.code === location.country);
      })
    });
    this.filterService.getAllFilters().subscribe(filters => {
      this.filters = filters;
      this.currentFilter = filters[0];
      this.receiverFilter = filters[0];
    })
  }

  ngAfterViewInit(): void {
    this.initLocalVideo();
  }

  initLocalVideo() {
    this.webrtcService.initializeLocalVideo().then(stream => {
      this.localVideo!.nativeElement.srcObject = stream;
      this.isWaitingLocalVideo = false;
    });
  }

  startCall() {
    if (!this.localVideo?.nativeElement.srcObject) {
      this.initLocalVideo();
      return;
    }
    this.websocketService.sendMessage({command: "match", data: {}});
    this.isStarted = true;
    this.isWaitingRemoteVideo = true;
  }

  nextCall() {
    this.websocketService.sendMessage({ command: "next", receiverId: this.receiverId });
    this.nextHandle();
  }

  stopCall() {
    this.webrtcService.closePeerConnection();
    this.remoteVideo!.nativeElement.srcObject = null;
    this.messages = [];
    this.websocketService.sendMessage({command: "stopCall", receiverId: this.receiverId});
    this.isStarted = false;
    this.isWaitingRemoteVideo = false;
  }

  openModal() {
    this.filterCountries = this.countries;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  selectCountry(code: string) {
    this.currenCountry = this.countries.find(country => country.code === code);
    this.closeModal();
  }

  searchCountry(event: any) {
    const searchTerm = event.target.value.toLowerCase().trim();
    if (searchTerm === "") {
      this.filterCountries = this.countries;
    } else {
      this.filterCountries = this.countries.filter(country => {
        return country.name.toLowerCase().includes(searchTerm);
      })
    }
  }

  onChangeFilter(filterId: number) {
    this.currentFilter = this.filters.find(filter => filter.filterId === filterId);
    if (this.receiverId && !this.isWaitingRemoteVideo) {
      this.websocketService.sendMessage({command: "filter", receiverId: this.receiverId, data: { filterId: this.currentFilter?.filterId} })
    }
  }

  onChangeReceiverFilter(filterId: number) {
    this.receiverFilter = this.filters.find(filter => filter.filterId === filterId);
  }

  handleMessage() {
    this.websocketService.getMessages()?.subscribe(msg => {
      switch (msg.command) {
        case 'createOffer':
          this.receiverId = msg.receiverId;
          this.webrtcService.createPeerConnection(this.remoteVideo!).then(peerConnection => {
            this.currentDataChannel = peerConnection.createDataChannel('myDataChannel');
            this.currentDataChannel.onopen = () => {
            };
            this.currentDataChannel.onclose = () => {
            };
            this.currentDataChannel.onerror = (error) => {
              console.log(error)
            }
            peerConnection.onicecandidate = ({candidate}) => {
              if (candidate) {
                this.websocketService.sendMessage({command: "candidate", receiverId: this.receiverId, data: candidate});
              }
            };
            peerConnection.createOffer().then(async offer => {
              await peerConnection.setLocalDescription(offer);
              this.websocketService.sendMessage({command: 'offer', receiverId: this.receiverId, data: offer});
            });
            peerConnection.ondatachannel = (event) => {
              const receiveChannel = event.channel;
              receiveChannel.onmessage = (event) => {
                const message: Message = {
                  sender: 'client',
                  message: event.data
                }
                this.messages.push(message);
                this.cdr.detectChanges();
              }
            }
          });
          break;

        case 'offer':
          this.webrtcService.createPeerConnection(this.remoteVideo!).then(peerConnection => {
            this.currentDataChannel = peerConnection.createDataChannel('myDataChannel');
            this.currentDataChannel.onopen = () => {
              console.log('DataChannel is open');
            };
            this.currentDataChannel.onclose = () => {
              console.log('DataChannel is closed');
            };
            peerConnection.onicecandidate = ({candidate}) => {
              if (candidate) {
                this.websocketService.sendMessage({command: "candidate", receiverId: this.receiverId, data: candidate});
              }
            }
            peerConnection.setRemoteDescription(new RTCSessionDescription(msg.data)).then(() => {
              this.webrtcService.createAnswer().then(answer => {
                this.websocketService.sendMessage({command: "answer", receiverId: this.receiverId, data: answer});
                this.websocketService.sendMessage({command: "filter", receiverId: this.receiverId, data: { filterId: this.currentFilter?.filterId} })
              });
            });
            peerConnection.ondatachannel = (event) => {
              const receiveChannel = event.channel;
              receiveChannel.onmessage = (event) => {
                const message: Message = {
                  sender: 'client',
                  message: event.data
                }
                this.messages.push(message);
                this.cdr.detectChanges();
              }
            }
            peerConnection.oniceconnectionstatechange = () => {
              console.log("ICE Connection State:", peerConnection.iceConnectionState);
              if (peerConnection.iceConnectionState === 'failed') {
                console.error('ICE Connection Failed');
              }
            };
          });
          this.isWaitingRemoteVideo = false;
          break;

        case 'answer':
          this.webrtcService.setRemoteDescription(msg.data).catch(err => console.error(err));
          this.websocketService.sendMessage({command: "filter", receiverId: this.receiverId, data: { filterId: this.currentFilter?.filterId} })
          this.isWaitingRemoteVideo = false;
          break;

        case 'candidate':
          this.webrtcService.setIceCandidate(msg.data).catch(err => console.error(err));
          break;

        case 'countUser':
          this.countUser = msg.count;
          break;

        case 'info':
          this.receiverId = msg.receiverId;
          break;

        case 'stopCall':
          this.nextHandle();
          break;

        case 'next':
          this.nextHandle();
          break;
        case 'filter':
          this.onChangeReceiverFilter(msg.data.filterId);
          break;
        default:
          console.warn('Unknown command:', msg.command);
      }
    });
  }

  nextHandle() {
    this.webrtcService.closePeerConnection();
    this.remoteVideo!.nativeElement.srcObject = null;
    this.messages = [];
    this.websocketService.sendMessage({command: "match", data: {}});
    this.isWaitingRemoteVideo = true;
  }

  sendMessage() {
    if (this.currentDataChannel) {
      if (this.currentDataChannel.readyState === 'open') {
        const messageText = this.messageInput.trim();
        if (messageText) {
          const message: Message = {
            sender: 'me',
            message: messageText
          };
          this.messages.push(message);
          this.currentDataChannel.send(messageText);
          this.messageInput = '';
        }
      } else {
        console.warn('DataChannel is not open');
      }
    } else {
      console.warn('DataChannel is not established');
    }
  }

}
