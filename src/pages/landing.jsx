import React, { useState } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const router = useNavigate();
  const [guestCode, setGuestCode] = useState('');
  const [showGuestInput, setShowGuestInput] = useState(false);

  const handleGuestJoin = (e) => {
    e?.preventDefault();
    const code = guestCode.trim() || `guest-${Math.random().toString(36).substring(2, 8)}`;
    router(`/${code}`);
  };

  return (
    <div className="landingPageContainer">
      {/* Navbar */}
      <nav className="landingNav">
        <div className="navBrand" onClick={() => router('/')} style={{ cursor: 'pointer' }}>
          <h2>🎥 MeetSphere</h2>
        </div>
        <div className="navlist">
          <a href="#features" className="navLink">Features</a>
          <a href="#how-it-works" className="navLink">How It Works</a>
          <button 
            className="navBtn secondaryBtn"
            onClick={() => setShowGuestInput(!showGuestInput)}
          >
            Join as Guest
          </button>
          <button 
            className="navBtn secondaryBtn"
            onClick={() => router('/auth')}
          >
            Sign In
          </button>
          <button 
            className="navBtn createBtn"
            style={{ padding: '8px 18px', fontSize: '0.9rem' }}
            onClick={() => router('/auth')}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Guest Quick Join Modal / Bar Banner */}
      {showGuestInput && (
        <div className="guestBanner">
          <form onSubmit={handleGuestJoin} className="guestForm">
            <span>Enter Room Code to Join directly:</span>
            <input
              type="text"
              placeholder="e.g. room-abc1234 or leave empty for random"
              value={guestCode}
              onChange={(e) => setGuestCode(e.target.value)}
            />
            <button type="submit" className="joinBtn">
              Join Now 🚀
            </button>
            <button 
              type="button" 
              className="closeBannerBtn"
              onClick={() => setShowGuestInput(false)}
            >
              ✕
            </button>
          </form>
        </div>
      )}

      {/* Main Hero Section */}
      <main className="landingHero">
        <div className="heroLeft">
          <div className="badgePill">
            ✨ Next-Gen Video Conferences
          </div>
          <h1>
            <span className="highlightText">Connect</span> with your loved ones anywhere
          </h1>
          <p className="heroSubtitle">
            Cover any distance with MeetSphere. Experience ultra-clear HD video, 
            instant room sharing, and end-to-end real-time communication straight from your browser.
          </p>

          <div className="heroActions">
            <button 
              className="createBtn"
              onClick={() => router('/auth')}
            >
              Get Started for Free ➔
            </button>
            <button 
              className="secondaryCtaBtn"
              onClick={() => setShowGuestInput(true)}
            >
              👤 Join as Guest
            </button>
          </div>

          <div className="quickTips">
            <span>🔒 End-to-End Security</span>
            <span>⚡ Low Latency WebRTC</span>
            <span>💬 Free Room Chat</span>
          </div>
        </div>
      </main>

      {/* Feature Showcase Grid */}
      <section id="features" className="landingFeatures">
        <div className="sectionHeader">
          <h2>Why Choose <span className="highlightText">MeetSphere</span>?</h2>
          <p>Everything you need for personal catch-ups and professional meetings.</p>
        </div>

        <div className="featuresGrid">
          <div className="featureCard">
            <div className="featureIcon">📹</div>
            <h3>HD Video & Audio</h3>
            <p>Crystal clear 1080p video stream powered by WebRTC with low latency performance.</p>
          </div>

          <div className="featureCard">
            <div className="featureIcon">⚡</div>
            <h3>Instant Room Creation</h3>
            <p>Generate secure video meeting rooms with a single click and share links instantly.</p>
          </div>

          <div className="featureCard">
            <div className="featureIcon">💬</div>
            <h3>In-Room Real-time Chat</h3>
            <p>Send text messages, links, and notes to all participants live during the meeting.</p>
          </div>

          <div className="featureCard">
            <div className="featureIcon">🔒</div>
            <h3>Private & Encrypted</h3>
            <p>Your privacy matters. Direct peer-to-peer streaming keeps your calls confidential.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="howItWorksSection">
        <div className="sectionHeader">
          <h2>How It <span className="highlightText">Works</span></h2>
          <p>Get connected in 3 simple steps</p>
        </div>

        <div className="stepsGrid">
          <div className="stepCard">
            <div className="stepNumber">1</div>
            <h3>Sign Up or Join as Guest</h3>
            <p>Create an account to save meeting history or join instantly without registration.</p>
          </div>
          <div className="stepCard">
            <div className="stepNumber">2</div>
            <h3>Create a Meeting Room</h3>
            <p>Generate a unique room code and share it with your friends, family, or teammates.</p>
          </div>
          <div className="stepCard">
            <div className="stepNumber">3</div>
            <h3>Start Video Calling</h3>
            <p>Enjoy HD video, high quality audio, and live chat directly in your browser.</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="landingCtaBanner">
        <h2>Ready to start your video call?</h2>
        <p>No downloads required. Works directly in your browser.</p>
        <div className="ctaBannerBtns">
          <button className="createBtn" onClick={() => router('/auth')}>
            Get Started Free
          </button>
          <button className="secondaryCtaBtn" onClick={handleGuestJoin}>
            Join Quick Guest Call
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landingFooter">
        <div>
          <strong>MeetSphere</strong> &copy; {new Date().getFullYear()} — Connect with your loved ones.
        </div>
        <div className="footerLinks">
          <span onClick={() => router('/')}>Home</span>
          <span onClick={() => router('/auth')}>Sign In</span>
          <span onClick={() => router('/auth')}>Register</span>
          <span onClick={() => router('/history')}>History</span>
        </div>
      </footer>
    </div>
  );
}