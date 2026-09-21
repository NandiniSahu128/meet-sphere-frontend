import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../App.css';

export default function HomeComponent() {
  const [meetingCode, setMeetingCode] = useState('');
  const { userData, setUserData, addToUserHistory } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (setUserData) setUserData(null);
    navigate('/auth');
  };

  const handleJoinMeeting = (e) => {
    e?.preventDefault();
    if (!meetingCode.trim()) return;
    if (userData?.token) {
      addToUserHistory(meetingCode.trim());
    }
    navigate(`/${meetingCode.trim()}`);
  };

  const handleCreateMeeting = () => {
    const randomCode = Math.random().toString(36).substring(2, 9);
    const newCode = `room-${randomCode}`;
    if (userData?.token) {
      addToUserHistory(newCode);
    }
    navigate(`/${newCode}`);
  };

  return (
    <div className="homeContainer">
      <nav className="homeNav">
        <div className="navBrand">
          <h2>MeetSphere</h2>
        </div>
        <div className="navActions">
          {userData?.username && (
            <span className="userBadge">👤 {userData.username}</span>
          )}
          <button className="navBtn secondaryBtn" onClick={() => navigate('/history')}>
            📜 Call History
          </button>
          <button className="navBtn dangerBtn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </nav>

      <main className="homeMain">
        <div className="homeHeroLeft">
          <h1>
            Premium <span className="highlightText">Video Meetings</span> for Everyone
          </h1>
          <p className="heroSubtitle">
            Connect, collaborate, and celebrate from anywhere with crystal clear video and real-time audio.
          </p>

          <div className="actionCard">
            <button className="createBtn" onClick={handleCreateMeeting}>
              ➕ New Meeting
            </button>

            <form onSubmit={handleJoinMeeting} className="joinForm">
              <input
                type="text"
                placeholder="Enter room code (e.g. room-abc1234)"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
              />
              <button type="submit" className="joinBtn" disabled={!meetingCode.trim()}>
                Join
              </button>
            </form>
          </div>

          <div className="quickTips">
            <span>🔒 Secure & Encrypted</span>
            <span>⚡ Low Latency WebRTC</span>
            <span>💬 Live Room Chat</span>
          </div>
        </div>

        <div className="homeHeroRight">
          <div className="graphicCard">
            <div className="videoPreviewPlaceholder">
              <div className="avatarCircle">🎥</div>
              <h3>Start or Join a Meeting</h3>
              <p>Share your link with teammates or loved ones to get connected instantly.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

