import React, { useEffect, useRef, useState } from 'react';
import { webrtcService, Participant, ChatMessage } from '../../services/webrtc';
import { VideoGrid } from './VideoGrid';
import { ChatPanel } from './ChatPanel';
import { ControlPanel } from './ControlPanel';

interface VideoRoomProps {
  roomId: string;
  user: any;
  onLeaveRoom: () => void;
}

export const VideoRoom: React.FC<VideoRoomProps> = ({ roomId, user, onLeaveRoom }) => {
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          return;
        }

        // Set up event handlers
        webrtcService.setEventHandlers({
          onParticipantJoined: (participant) => {
            setParticipants(prev => new Map(prev.set(participant.userId, participant)));
          },
          onParticipantLeft: (userId) => {
            setParticipants(prev => {
              const newMap = new Map(prev);
              newMap.delete(userId);
              return newMap;
            });
          },
          onChatMessage: (message) => {
            setChatMessages(prev => [...prev, message]);
          },
          onError: (errorMsg) => {
            setError(errorMsg);
          }
        });

        // Connect and join room
        await webrtcService.connect(token);
        await webrtcService.joinRoom(roomId);
        
        // Get local stream
        const stream = webrtcService.getLocalStream();
        setLocalStream(stream);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize room:', err);
        setError(err instanceof Error ? err.message : 'Failed to join room');
        setLoading(false);
      }
    };

    initializeRoom();

    // Cleanup on unmount
    return () => {
      webrtcService.disconnect();
    };
  }, [roomId]);

  const handleToggleMute = () => {
    webrtcService.toggleMute();
    setIsMuted(prev => !prev);
  };

  const handleToggleVideo = () => {
    webrtcService.toggleVideo();
    setIsVideoOff(prev => !prev);
  };

  const handleSendMessage = (message: string) => {
    webrtcService.sendChatMessage(message);
  };

  const handleLeaveRoom = () => {
    webrtcService.disconnect();
    onLeaveRoom();
  };

  if (loading) {
    return (
      <div className="video-room loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Joining meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-room error">
        <div className="error-container">
          <h3>Failed to join meeting</h3>
          <p>{error}</p>
          <button onClick={onLeaveRoom} className="primary-button">
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-room">
      <div className="room-header">
        <h2>Meeting Room</h2>
        <div className="participant-count">
          {participants.size + 1} participant{participants.size !== 0 ? 's' : ''}
        </div>
      </div>

      <div className="room-content">
        <div className={`video-section ${isChatOpen ? 'with-chat' : 'full-width'}`}>
          <VideoGrid
            localStream={localStream}
            participants={participants}
            currentUser={user}
          />
          
          <ControlPanel
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isChatOpen={isChatOpen}
            onToggleMute={handleToggleMute}
            onToggleVideo={handleToggleVideo}
            onToggleChat={() => setIsChatOpen(prev => !prev)}
            onLeaveRoom={handleLeaveRoom}
          />
        </div>

        {isChatOpen && (
          <div className="chat-section">
            <ChatPanel
              messages={chatMessages}
              currentUser={user}
              onSendMessage={handleSendMessage}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};