import React, { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { AuthContext } from '../contexts/AuthContext';
import server from '../utils/server';
import '../App.css';

const peerConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export default function VideoMeetComponent() {
  const { url } = useParams();
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);

  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const connections = useRef({});
  const iceCandidatesQueue = useRef({});

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const username = userData?.username || `Guest_${Math.floor(1000 + Math.random() * 9000)}`;

  const createPeerConnection = (targetSocketId, stream) => {
    if (connections.current[targetSocketId]) {
      return connections.current[targetSocketId];
    }

    const pc = new RTCPeerConnection(peerConfig);
    connections.current[targetSocketId] = pc;

    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('signal', targetSocketId, JSON.stringify({ ice: event.candidate }));
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const incomingStream = event.streams[0];
        setRemoteStreams((prev) => {
          const existing = prev.find((s) => s.id === targetSocketId);
          if (existing) {
            return prev.map((s) => (s.id === targetSocketId ? { id: targetSocketId, stream: incomingStream } : s));
          }
          return [...prev, { id: targetSocketId, stream: incomingStream }];
        });
      }
    };

    return pc;
  };

  const processIceQueue = async (targetSocketId, pc) => {
    if (iceCandidatesQueue.current[targetSocketId]) {
      for (const candidate of iceCandidatesQueue.current[targetSocketId]) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding queued ICE candidate:", e);
        }
      }
      iceCandidatesQueue.current[targetSocketId] = [];
    }
  };

  useEffect(() => {
    let isMounted = true;
    let activeStream = null;
    let activeSocket = null;

    const startCall = async () => {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 }, 
            aspectRatio: { ideal: 1.777777778 },
            facingMode: "user" 
          },
          audio: true
        });
      } catch (err) {
        console.warn("Retrying getUserMedia with basic constraints:", err);
        try {
          activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (e) {
          console.error("Failed to access camera/microphone:", e);
        }
      }

      if (!isMounted) {
        if (activeStream) {
          activeStream.getTracks().forEach((track) => track.stop());
        }
        return;
      }

      if (activeStream) {
        setLocalStream(activeStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = activeStream;
        }
      }

      activeSocket = io(server, {
        transports: ['websocket', 'polling']
      });
      socketRef.current = activeSocket;

      activeSocket.on('connect', () => {
        console.log("Socket connected:", activeSocket.id);
        activeSocket.emit('join-call', url);
      });

      activeSocket.on('user-joined', (id, clients) => {
        console.log("User joined notification:", id, clients);

        clients.forEach((clientId) => {
          if (clientId === activeSocket.id) return;

          const pc = createPeerConnection(clientId, activeStream);

          if (clientId === id) {
            pc.createOffer()
              .then((offer) => pc.setLocalDescription(offer))
              .then(() => {
                activeSocket.emit('signal', clientId, JSON.stringify({ sdp: pc.localDescription }));
              })
              .catch((e) => console.error("Error creating offer:", e));
          }
        });
      });

      activeSocket.on('signal', async (fromId, message) => {
        if (fromId === activeSocket.id) return;
        try {
          const signalData = JSON.parse(message);
          const pc = createPeerConnection(fromId, activeStream);

          if (signalData.sdp) {
            await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
            await processIceQueue(fromId, pc);

            if (signalData.sdp.type === 'offer') {
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              activeSocket.emit('signal', fromId, JSON.stringify({ sdp: pc.localDescription }));
            }
          }

          if (signalData.ice) {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(signalData.ice));
            } else {
              if (!iceCandidatesQueue.current[fromId]) {
                iceCandidatesQueue.current[fromId] = [];
              }
              iceCandidatesQueue.current[fromId].push(signalData.ice);
            }
          }
        } catch (e) {
          console.error("Signal processing error:", e);
        }
      });

      activeSocket.on('user-left', (id) => {
        if (connections.current[id]) {
          connections.current[id].close();
          delete connections.current[id];
        }
        delete iceCandidatesQueue.current[id];
        setRemoteStreams((prev) => prev.filter((s) => s.id !== id));
      });

      activeSocket.on('chat-message', (data, sender, socketIdSender) => {
        setMessages((prev) => [...prev, { sender, data, socketId: socketIdSender }]);
      });
    };

    startCall();

    return () => {
      isMounted = false;
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      Object.values(connections.current).forEach((pc) => pc.close());
      connections.current = {};
      iceCandidatesQueue.current = {};
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, [url]);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !micEnabled;
      });
      setMicEnabled(!micEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(stream);
        setIsScreenSharing(true);

        const screenTrack = stream.getVideoTracks()[0];

        Object.values(connections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };
      } catch (err) {
        console.error("Screen sharing error:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);

    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      const videoTrack = localStream.getVideoTracks()[0];
      Object.values(connections.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !socketRef.current) return;

    socketRef.current.emit('chat-message', messageInput.trim(), username);
    setMessageInput('');
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess('Link Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const leaveCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    navigate('/home');
  };

  return (
    <div className="meetPageContainer">
      <header className="meetHeader">
        <div className="meetTitle">
          <h2>MeetSphere</h2>
          <span className="roomTag">Room: {url}</span>
        </div>
        <div className="meetHeaderRight">
          {copySuccess && <span className="toastNotice">{copySuccess}</span>}
          <button className="toolBtn secondary" onClick={copyRoomLink}>
            📋 Copy Link
          </button>
        </div>
      </header>

      <main className="meetMainGrid">
        <div className={`videoGrid ${showChat ? 'withChat' : ''}`}>
          {/* Local Video Card */}
          <div className="videoCard localVideoCard">
            <video ref={localVideoRef} autoPlay muted playsInline></video>
            <div className="videoBadge">
              <span>You ({username})</span>
              {!videoEnabled && <span className="offBadge">Video Off</span>}
              {!micEnabled && <span className="offBadge">Muted</span>}
            </div>
          </div>

          {/* Remote Video Cards */}
          {remoteStreams.map((item) => (
            <RemoteVideoCard key={item.id} id={item.id} stream={item.stream} />
          ))}
        </div>

        {/* Live Chat Panel */}
        {showChat && (
          <aside className="chatPanel">
            <div className="chatHeader">
              <h3>In-Call Messages</h3>
              <button className="closeChatBtn" onClick={() => setShowChat(false)}>✖</button>
            </div>

            <div className="messagesList">
              {messages.length === 0 ? (
                <p className="noMessages">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`messageItem ${msg.sender === username ? 'myMessage' : 'otherMessage'}`}
                  >
                    <span className="msgSender">{msg.sender}</span>
                    <p className="msgContent">{msg.data}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="chatInputForm">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </aside>
        )}
      </main>

      {/* Floating Bottom Controls Toolbar */}
      <footer className="meetControlsToolbar">
        <button
          className={`controlBtn ${!micEnabled ? 'activeOff' : ''}`}
          onClick={toggleMic}
          title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
        >
          {micEnabled ? '🎙️ Mute' : '🔇 Unmute'}
        </button>

        <button
          className={`controlBtn ${!videoEnabled ? 'activeOff' : ''}`}
          onClick={toggleVideo}
          title={videoEnabled ? 'Stop Video' : 'Start Video'}
        >
          {videoEnabled ? '📹 Stop Video' : '🚫 Start Video'}
        </button>

        <button
          className={`controlBtn ${isScreenSharing ? 'activeOn' : ''}`}
          onClick={toggleScreenShare}
          title="Share Screen"
        >
          {isScreenSharing ? '🖥️ Stop Share' : '🖥️ Share Screen'}
        </button>

        <button
          className={`controlBtn ${showChat ? 'activeOn' : ''}`}
          onClick={() => setShowChat(!showChat)}
          title="Chat"
        >
          💬 Chat ({messages.length})
        </button>

        <button className="controlBtn endCallBtn" onClick={leaveCall} title="Leave Call">
          📞 Leave Call
        </button>
      </footer>
    </div>
  );
}

// Sub-component for rendering remote peer streams dynamically
function RemoteVideoCard({ id, stream }) {
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (remoteVideoRef.current && stream) {
      remoteVideoRef.current.srcObject = stream;
      remoteVideoRef.current.play().catch((err) => console.log("Remote play fallback:", err));
    }
  }, [stream]);

  return (
    <div className="videoCard remoteVideoCard">
      <video ref={remoteVideoRef} autoPlay playsInline></video>
      <div className="videoBadge">
        <span>Participant</span>
      </div>
    </div>
  );
}


