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

// {
//   echoCancellation: {exact: true}, // Bật hủy tiếng vọng
//   noiseSuppression: true,         // Bật giảm tiếng ồn
//   autoGainControl: true,          // Bật điều chỉnh tự động âm lượng
//   googEchoCancellation: true,    // Cấu hình hủy tiếng vọng nâng cao của Google
//   googNoiseSuppression: true,    // Cấu hình giảm tiếng ồn nâng cao của Google
//   googAutoGainControl: true      // Cấu hình điều chỉnh âm lượng tự động nâng cao của Google
// }
  private constraints = {
    audio: false,
    video: {
      width: 1280, height: 720
    }
  }

  constructor() { }

  async initializeLocalVideo(): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia(this.constraints);
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

  async createOffer() {
    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);
    return offer;
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
