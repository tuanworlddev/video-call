import {ElementRef, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {
  private localStream?: MediaStream;
  private peerConnection?: RTCPeerConnection;

  private rtcConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  }

  constructor() { }

  async initializeLocalVideo(): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    return this.localStream;
  }

  async createPeerConnection(remoteVideoRef: ElementRef) {
    this.peerConnection = new RTCPeerConnection(this.rtcConfiguration);

    this.localStream?.getTracks().forEach(track => this.peerConnection?.addTrack(track, this.localStream!));

    this.peerConnection.ontrack = (event) => {
      remoteVideoRef!.nativeElement.srcObject = event.streams[0];
    }

    return this.peerConnection;
  }

  closePeerConnection() {
    if (this.peerConnection) {
      this.peerConnection!.close();
      this.peerConnection = undefined;
    }
  }

  onIcecandidate() {
    return this.peerConnection!.onicecandidate;
  }

  async createOffer() {
    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);
    return offer;
  }

  async setLocalDescription(offer: any) {
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
  }

  async setRemoteDescription(answer: any) {
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async createAnswer() {
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    return answer;
  }

  async setIceCandidate(candidate: any) {
    await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
  }

}
