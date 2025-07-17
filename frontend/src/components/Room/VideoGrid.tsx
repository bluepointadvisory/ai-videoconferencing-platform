import React, { useRef, useEffect } from 'react';
import { Participant } from '../../services/webrtc';

interface VideoGridProps {
  localStream: MediaStream | null;
  participants: Map<string, Participant>;
  currentUser: any;
}

interface VideoTileProps {
  stream: MediaStream | null;
  username: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

const VideoTile: React.FC<VideoTileProps> = ({ 
  stream, 
  username, 
  isLocal = false, 
  isMuted = false,
  isVideoOff = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="video-tile">
      <div className="video-container">
        {stream && !isVideoOff ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal} // Mute local video to prevent echo
            className="video-stream"
          />
        ) : (
          <div className="video-placeholder">
            <div className="avatar">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        <div className="video-overlay">
          <div className="participant-info">
            <span className="username">
              {username} {isLocal && '(You)'}
            </span>
            {isMuted && <span className="muted-indicator">🔇</span>}
            {isVideoOff && <span className="video-off-indicator">📹</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoGrid: React.FC<VideoGridProps> = ({ 
  localStream, 
  participants, 
  currentUser 
}) => {
  const participantArray = Array.from(participants.values());
  const totalParticipants = participantArray.length + 1; // +1 for local user

  const getGridClass = () => {
    if (totalParticipants === 1) return 'grid-1';
    if (totalParticipants === 2) return 'grid-2';
    if (totalParticipants <= 4) return 'grid-4';
    if (totalParticipants <= 6) return 'grid-6';
    return 'grid-many';
  };

  return (
    <div className={`video-grid ${getGridClass()}`}>
      {/* Local user video */}
      <VideoTile
        stream={localStream}
        username={currentUser.displayName || currentUser.username}
        isLocal={true}
        isMuted={localStream ? !localStream.getAudioTracks()[0]?.enabled : false}
        isVideoOff={localStream ? !localStream.getVideoTracks()[0]?.enabled : false}
      />

      {/* Remote participants */}
      {participantArray.map((participant) => (
        <VideoTile
          key={participant.userId}
          stream={participant.stream || null}
          username={participant.username}
          isMuted={participant.stream ? !participant.stream.getAudioTracks()[0]?.enabled : false}
          isVideoOff={participant.stream ? !participant.stream.getVideoTracks()[0]?.enabled : false}
        />
      ))}
    </div>
  );
};