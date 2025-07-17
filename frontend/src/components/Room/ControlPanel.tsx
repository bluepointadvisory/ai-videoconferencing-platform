import React from 'react';

interface ControlPanelProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isChatOpen: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleChat: () => void;
  onLeaveRoom: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isMuted,
  isVideoOff,
  isChatOpen,
  onToggleMute,
  onToggleVideo,
  onToggleChat,
  onLeaveRoom
}) => {
  return (
    <div className="control-panel">
      <div className="controls">
        <button
          className={`control-button ${isMuted ? 'muted' : 'active'}`}
          onClick={onToggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>

        <button
          className={`control-button ${isVideoOff ? 'video-off' : 'active'}`}
          onClick={onToggleVideo}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isVideoOff ? '📹' : '📷'}
        </button>

        <button
          className={`control-button ${isChatOpen ? 'active' : ''}`}
          onClick={onToggleChat}
          title="Toggle chat"
        >
          💬
        </button>

        <button
          className="control-button leave-button"
          onClick={onLeaveRoom}
          title="Leave meeting"
        >
          📞
        </button>
      </div>
    </div>
  );
};