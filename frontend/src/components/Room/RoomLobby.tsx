import React, { useState } from 'react';
import { apiService } from '../../services/api';

interface RoomLobbyProps {
  user: any;
  onJoinRoom: (roomId: string) => void;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({ user, onJoinRoom }) => {
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.createRoom({
        name: roomName,
        description: `Created by ${user.displayName || user.username}`,
        maxParticipants: 10
      });
      
      onJoinRoom(response.room.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.getRoom(roomId);
      onJoinRoom(roomId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-lobby">
      <div className="lobby-header">
        <h1>AIMeetings</h1>
        <p>Welcome, {user.displayName || user.username}!</p>
      </div>

      <div className="lobby-content">
        <div className="mode-selector">
          <button
            className={`mode-button ${mode === 'create' ? 'active' : ''}`}
            onClick={() => setMode('create')}
          >
            Create Meeting
          </button>
          <button
            className={`mode-button ${mode === 'join' ? 'active' : ''}`}
            onClick={() => setMode('join')}
          >
            Join Meeting
          </button>
        </div>

        {mode === 'create' ? (
          <form onSubmit={handleCreateRoom} className="room-form">
            <h3>Create a New Meeting</h3>
            <div className="form-group">
              <label htmlFor="roomName">Meeting Name</label>
              <input
                type="text"
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter meeting name"
                required
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading || !roomName.trim()} className="primary-button">
              {loading ? 'Creating...' : 'Create Meeting'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinRoom} className="room-form">
            <h3>Join an Existing Meeting</h3>
            <div className="form-group">
              <label htmlFor="roomId">Meeting ID</label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter meeting ID"
                required
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading || !roomId.trim()} className="primary-button">
              {loading ? 'Joining...' : 'Join Meeting'}
            </button>
          </form>
        )}
      </div>

      <div className="lobby-features">
        <h3>Features</h3>
        <ul>
          <li>🎥 High-quality video conferencing</li>
          <li>🎙️ Real-time AI transcription</li>
          <li>🧠 AI-powered meeting insights</li>
          <li>💬 In-meeting chat</li>
          <li>🔒 Secure and private</li>
        </ul>
      </div>
    </div>
  );
};