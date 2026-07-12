# 💬 Real-Time Chat Application

A real-time chat app built with **React (Vite)** on the frontend and **Node.js + Express + Socket.io** on the backend, with **SQLite** for persisting chat history.

---

## ✨ Features

### Core (required)
- Send and receive messages instantly via **Socket.io**
- Chat history persists in SQLite and loads on refresh
- Message timestamps
- REST APIs: send message (`POST /api/messages`) and fetch history (`GET /api/messages`)
- Graceful handling of connect/disconnect and API/socket errors

### Bonus (implemented)
- ✅ Username-based dummy login (no password, stored in `sessionStorage`)
- ✅ Typing indicator ("X is typing...")
- ✅ Online/offline user status (sidebar with live user list)
- ✅ Message delivered/read status (single tick → double tick, simulated delivered status + read receipts)
- ✅ Persistent storage using **SQLite** (via `better-sqlite3`, no external DB server needed)

---

## 📸 Screenshots

**Login screen (dummy username-based auth)**
https://github.com/shahanshah786/real-time-chat-app/blob/de1b8e7dc523e290d4a8df2673f0acfeb313608c/Screenshot%202026-07-12%20130158.png

**Chat window with message sent, timestamp, and delivered/read ticks**
![Single user chat](./screenshots/02-chat-single-user.png)

**Multiple users online, live typing/messages, and presence sidebar**
![Multiple users chatting](./screenshots/03-multiple-users-chat.png)

**Real-time sync across multiple browser windows (3 users chatting simultaneously)**
![Multi-window real-time sync](./screenshots/04-multi-window-realtime.png)

---

## 🗂 Project Structure

```
real-time-chat-app/
├── backend/
│   ├── models/messageModel.js   # DB access layer
│   ├── routes/messages.js       # REST endpoints
│   ├── socket/index.js          # Socket.io event handlers
│   ├── db.js                    # SQLite setup
│   ├── server.js                # Express + Socket.io entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Login, ChatWindow, MessageList, MessageInput, UserList, TypingIndicator
│   │   ├── context/SocketContext.jsx
│   │   ├── api.js                # REST API helper
│   │   ├── App.jsx
│   │   └── styles.css
│   └── package.json
├── screenshots/                 # App screenshots used in this README
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+ and npm installed

### 1. Clone the repo
```bash
git clone https://github.com/shahanshah786/real-time-chat-app.git
cd real-time-chat-app
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev        # starts on http://localhost:5000 (uses nodemon)
# or: npm start
```

### 3. Frontend setup
(in a new terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev        # starts on http://localhost:5173
```

Open **http://localhost:5173**, enter a username, and start chatting. Open the app in two browser tabs/windows with different usernames to see real-time messaging, typing indicators, and online status in action.

---

## 🔑 Environment Variables

**backend/.env**
| Variable | Description | Default |
|---|---|---|
| `PORT` | Port the Express/Socket.io server runs on | `5000` |
| `CLIENT_ORIGIN` | Frontend URL allowed by CORS | `http://localhost:5173` |

**frontend/.env**
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend base URL used for REST calls + socket connection | `http://localhost:5000` |

---

## 🧠 Design Decisions

- **Vite + React** was used for the frontend instead of Create React App for faster dev builds and a simpler setup, and instead of React Native because building/signing an APK requires an Android SDK/build toolchain that isn't available in this environment. The submission guidelines explicitly allow a **screen recording** as an alternative to an APK, so a fully working, responsive web app is provided along with a recording.
- **SQLite (`better-sqlite3`)** was chosen for storage instead of MongoDB because it needs no external server/connection string — the whole project runs with just `npm install`, which keeps setup friction-free for reviewers, while still satisfying the "store messages in a database" bonus requirement. Swapping to MongoDB would only require changing `models/messageModel.js`.
- **Socket.io is the only transport for real-time updates** (no polling), per the mandatory requirement. The REST API is used for the initial history load (and as a fallback way to send a message if the socket is temporarily disconnected), while Socket.io handles instant delivery, typing indicators, presence, and read/delivered receipts.
- **Dummy auth via username only** — no passwords/JWT, since the task only asked for a "username-based login (dummy authentication)" bonus, not full auth.
- **In-memory online-user tracking** (`Map` of `socket.id -> username`) is used for presence, since online status is transient and doesn't need to survive a server restart — while messages themselves are persisted to SQLite so history survives a refresh.
- Code is split into clean layers: **routes** (REST), **socket handlers** (real-time events), and a **model** layer (DB access) on the backend; and reusable, single-responsibility **components** + a **SocketContext** on the frontend.

---

## 🤔 Assumptions

- This is a single public chat room (no private 1:1 rooms or group creation), matching the assignment's scope.
- Message "read" status is broadcast globally rather than per-recipient, since there's only one shared room.
- No message editing/deleting was required, so it isn't implemented.
- Usernames are not required to be unique (kept simple, since this is dummy auth).

---

## 🚀 Deployment

**Live Backend API URL:** https://chat-backend-1i2j.onrender.com/

The backend has been deployed on **Render** as a Node web service, with the `CLIENT_ORIGIN` environment variable set to allow requests from the frontend.

## 📱 Note on APK

A React (web) implementation is provided as the primary deliverable, working seamlessly across desktop and mobile browsers. As allowed by the submission guidelines, a screen recording is provided in place of an APK.
