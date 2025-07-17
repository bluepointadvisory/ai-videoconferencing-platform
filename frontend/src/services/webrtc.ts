import { Device } from 'mediasoup-client';
import { Transport, Producer, Consumer, RtpCapabilities } from 'mediasoup-client/lib/types';
import { io, Socket } from 'socket.io-client';

const SIGNALING_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3002';

export interface Participant {
  userId: string;
  username: string;
  stream?: MediaStream;
  audioProducer?: Producer;
  videoProducer?: Producer;
  consumers: Map<string, Consumer>;
}

export interface ChatMessage {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export class WebRTCService {
  private socket: Socket | null = null;
  private device: Device | null = null;
  private sendTransport: Transport | null = null;
  private recvTransport: Transport | null = null;
  private localStream: MediaStream | null = null;
  private participants: Map<string, Participant> = new Map();
  private roomId: string | null = null;
  
  private onParticipantJoined?: (participant: Participant) => void;
  private onParticipantLeft?: (userId: string) => void;
  private onParticipantStreamAdded?: (participant: Participant) => void;
  private onChatMessage?: (message: ChatMessage) => void;
  private onError?: (error: string) => void;

  async connect(token: string): Promise<void> {
    this.socket = io(SIGNALING_URL, {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
    });

    this.socket.on('error', (error: { message: string }) => {
      console.error('Signaling error:', error);
      this.onError?.(error.message);
    });

    this.socket.on('joined-room', this.handleJoinedRoom.bind(this));
    this.socket.on('user-joined', this.handleUserJoined.bind(this));
    this.socket.on('user-left', this.handleUserLeft.bind(this));
    this.socket.on('offer', this.handleOffer.bind(this));
    this.socket.on('answer', this.handleAnswer.bind(this));
    this.socket.on('ice-candidate', this.handleIceCandidate.bind(this));
    this.socket.on('chat-message', this.handleChatMessage.bind(this));
    this.socket.on('user-mute-toggle', this.handleMuteToggle.bind(this));
    this.socket.on('user-video-toggle', this.handleVideoToggle.bind(this));

    await new Promise<void>((resolve, reject) => {
      this.socket!.on('connect', resolve);
      this.socket!.on('connect_error', reject);
    });
  }

  async joinRoom(roomId: string): Promise<void> {
    if (!this.socket) throw new Error('Not connected to signaling server');
    
    this.roomId = roomId;
    this.device = new Device();
    
    this.socket.emit('join-room', { roomId });
  }

  private async handleJoinedRoom(data: {
    roomId: string;
    participants: Array<{ userId: string; username: string }>;
    userInfo: { userId: string; username: string };
  }) {
    console.log('Joined room:', data);
    
    // Initialize existing participants
    data.participants.forEach(participant => {
      if (participant.userId !== data.userInfo.userId) {
        this.participants.set(participant.userId, {
          ...participant,
          consumers: new Map()
        });
        this.onParticipantJoined?.(this.participants.get(participant.userId)!);
      }
    });

    // Get user media
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
    } catch (error) {
      console.error('Failed to get user media:', error);
      this.onError?.('Failed to access camera/microphone');
      return;
    }
  }

  private handleUserJoined(data: { userId: string; username: string }) {
    console.log('User joined:', data);
    
    const participant: Participant = {
      ...data,
      consumers: new Map()
    };
    
    this.participants.set(data.userId, participant);
    this.onParticipantJoined?.(participant);
  }

  private handleUserLeft(data: { userId: string; username: string }) {
    console.log('User left:', data);
    
    const participant = this.participants.get(data.userId);
    if (participant) {
      // Clean up consumers
      participant.consumers.forEach(consumer => {
        consumer.close();
      });
      
      // Stop participant stream
      if (participant.stream) {
        participant.stream.getTracks().forEach(track => track.stop());
      }
      
      this.participants.delete(data.userId);
      this.onParticipantLeft?.(data.userId);
    }
  }

  private async handleOffer(data: { fromUserId: string; fromUsername: string; offer: RTCSessionDescriptionInit }) {
    // For now, we'll use simple peer-to-peer WebRTC
    // In a production system, this would route through the media server
    console.log('Received offer from:', data.fromUserId);
  }

  private async handleAnswer(data: { fromUserId: string; fromUsername: string; answer: RTCSessionDescriptionInit }) {
    console.log('Received answer from:', data.fromUserId);
  }

  private async handleIceCandidate(data: { fromUserId: string; candidate: RTCIceCandidateInit }) {
    console.log('Received ICE candidate from:', data.fromUserId);
  }

  private handleChatMessage(message: ChatMessage) {
    this.onChatMessage?.(message);
  }

  private handleMuteToggle(data: { userId: string; isMuted: boolean }) {
    const participant = this.participants.get(data.userId);
    if (participant && participant.stream) {
      const audioTrack = participant.stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !data.isMuted;
      }
    }
  }

  private handleVideoToggle(data: { userId: string; isVideoOff: boolean }) {
    const participant = this.participants.get(data.userId);
    if (participant && participant.stream) {
      const videoTrack = participant.stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !data.isVideoOff;
      }
    }
  }

  sendChatMessage(message: string) {
    if (!this.socket) return;
    this.socket.emit('chat-message', { message });
  }

  toggleMute() {
    if (!this.socket || !this.localStream) return;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.socket.emit('mute-toggle', { isMuted: !audioTrack.enabled });
    }
  }

  toggleVideo() {
    if (!this.socket || !this.localStream) return;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.socket.emit('video-toggle', { isVideoOff: !videoTrack.enabled });
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getParticipants(): Map<string, Participant> {
    return this.participants;
  }

  setEventHandlers(handlers: {
    onParticipantJoined?: (participant: Participant) => void;
    onParticipantLeft?: (userId: string) => void;
    onParticipantStreamAdded?: (participant: Participant) => void;
    onChatMessage?: (message: ChatMessage) => void;
    onError?: (error: string) => void;
  }) {
    this.onParticipantJoined = handlers.onParticipantJoined;
    this.onParticipantLeft = handlers.onParticipantLeft;
    this.onParticipantStreamAdded = handlers.onParticipantStreamAdded;
    this.onChatMessage = handlers.onChatMessage;
    this.onError = handlers.onError;
  }

  disconnect() {
    // Close local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close all participant streams
    this.participants.forEach(participant => {
      if (participant.stream) {
        participant.stream.getTracks().forEach(track => track.stop());
      }
      participant.consumers.forEach(consumer => consumer.close());
    });
    this.participants.clear();

    // Close transports
    if (this.sendTransport) {
      this.sendTransport.close();
      this.sendTransport = null;
    }
    
    if (this.recvTransport) {
      this.recvTransport.close();
      this.recvTransport = null;
    }

    // Disconnect socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.device = null;
    this.roomId = null;
  }
}

export const webrtcService = new WebRTCService();