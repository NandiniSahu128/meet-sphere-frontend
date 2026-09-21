# MeetSphere Frontend

Production-ready, responsive, dark-themed frontend web application for **MeetSphere** — a modern real-time video conferencing platform built with React, Vite, WebRTC, and Socket.io.

## 🚀 Features

- **High-Definition Video & Audio Meetings**: Peer-to-peer 1080p WebRTC video streams with low latency audio and dynamic grid layout.
- **Instant Meeting Rooms**: Generate one-click meeting links or join via custom room codes.
- **In-Room Real-Time Chat**: Live text messaging and link sharing inside active call rooms.
- **Authentication & Dashboard**: Personal meeting dashboard, JWT token persistence, and call history log.
- **Guest Access**: Join meetings directly without required user registration.
- **Responsive Dark Design**: Premium glassmorphic interface tailored with `#0d1117` radial gradients and vibrant `#ff9839` orange accents.

---

## 🛠️ Tech Stack

- **Framework**: React 19, Vite
- **Routing**: React Router v7 (`react-router-dom`)
- **Real-Time Communication**: WebRTC (`RTCPeerConnection`), Socket.io Client (`socket.io-client`)
- **Styling**: Vanilla CSS (CSS Design Tokens, Glassmorphism, Responsive Flex & Grid)

---

## 📁 Repository Structure

```
frontend/
├── public/                    # Static assets & icons
├── src/
│   ├── assets/                # Hero images and branding assets
│   ├── contexts/
│   │   └── AuthContext.jsx    # Authentication & User history state provider
│   ├── pages/
│   │   ├── landing.jsx        # Landing page (Hero, Features, Guest join, Footer)
│   │   ├── home.jsx           # Dashboard (Create / Join meeting room)
│   │   ├── authentication.jsx # Sign In & Sign Up tabbed card forms
│   │   ├── VideoMeet.jsx      # Video conferencing call room with WebRTC & Chat
│   │   └── history.jsx        # Past meeting call history
│   ├── utils/
│   │   └── server.js          # Dynamic Express backend API configuration
│   ├── App.css                # Global UI design system & page styles
│   ├── index.css              # Reset & full-bleed container layout rules
│   ├── App.jsx                # Router setup & routes
│   └── main.jsx               # Application entry point
├── index.html                 # HTML template
├── package.json
└── vite.config.js
```

---

## ⚙️ Quick Start

1. **Clone Repository**:
   ```bash
   git clone https://github.com/NandiniSahu128/meet-sphere-frontend.git
   cd meet-sphere-frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Development Server**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 📄 License

[ISC](LICENSE) &copy; Nandini Sahu
