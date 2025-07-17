import React, { useState, useEffect } from 'react';
import './App.css';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { RoomLobby } from './components/Room/RoomLobby';
import { VideoRoom } from './components/Room/VideoRoom';
import { apiService, User } from './services/api';

type AppState = 'loading' | 'auth' | 'lobby' | 'room';
type AuthMode = 'login' | 'register';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [user, setUser] = useState<User | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = apiService.getToken();
    if (token) {
      // TODO: Validate token with server
      setAppState('lobby');
    } else {
      setAppState('auth');
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setAppState('lobby');
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    setAppState('lobby');
  };

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setAppState('room');
  };

  const handleLeaveRoom = () => {
    setCurrentRoomId(null);
    setAppState('lobby');
  };

  const handleLogout = () => {
    apiService.removeToken();
    setUser(null);
    setCurrentRoomId(null);
    setAppState('auth');
  };

  if (appState === 'loading') {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading AIMeetings...</p>
        </div>
      </div>
    );
  }

  if (appState === 'auth') {
    return (
      <div className="App">
        {authMode === 'login' ? (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthMode('register')}
          />
        ) : (
          <Register
            onRegister={handleRegister}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </div>
    );
  }

  if (appState === 'lobby') {
    return (
      <div className="App">
        <div className="app-header">
          <div className="user-info">
            Welcome, {user?.displayName || user?.username}
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
        <RoomLobby user={user} onJoinRoom={handleJoinRoom} />
      </div>
    );
  }

  if (appState === 'room' && currentRoomId) {
    return (
      <div className="App">
        <VideoRoom
          roomId={currentRoomId}
          user={user}
          onLeaveRoom={handleLeaveRoom}
        />
      </div>
    );
  }

  return null;
}

export default App;
