# 📋 TrelloFlow - Visual Kanban Project Management

A modern, high-performance Trello Kanban clone powered by a **Python FastAPI** backend with **SQLite** persistence and an interactive **Vite + React + Tailwind CSS** frontend.

![TrelloFlow Banner](https://raw.githubusercontent.com/alipedramiau-bit/trelloflow-fastapi-react/main/public/banner.png)

---

## 🚀 Key Features

- **Intuitive Kanban Board**: Drag & drop cards smoothly across custom columns (To Do, In Progress, Code Review, Done).
- **Rich Card Details**:
  - Multi-line description with real-time editing.
  - Interactive checklists with percentage progress bars.
  - Custom color tags & labels.
  - Due dates with smart status flags (Overdue, Due Soon, Completed).
  - Team member assignment with avatars.
  - Cover color customization.
  - Team discussion comments with timestamps.
- **FastAPI + Uvicorn Async Backend**:
  - Full RESTful API with SQLite relational database.
  - Automatic Swagger UI interactive documentation at `/api/docs`.
  - Pydantic models for request/response validation.
- **Bilingual & RTL-Ready**: Full Persian (فارسی / RTL) and English (LTR) language support with modern Vazirmatn typography.
- **Curated Themes**: Switch between 6 atmospheric gradient themes (Ocean, Sunset, Forest, Midnight, Lavender, Amber).
- **Audit Activity Trail**: Real-time activity log tracking card creation, movements, comments, and board changes.
- **Data Export & Import**: Backup and restore boards with JSON, plus instant database reset to sample data.

---

## 🔐 Default Admin Credentials

On the login screen:
- **Username:** `AdminParsa`
- **Password:** `Parsa@1405`
*(A quick one-click auto-fill button is available on the login page)*

---

## 🌐 Network Ports

- **Backend (FastAPI)**: `http://localhost:6000`
- **Frontend (Vite React)**: `http://localhost:6100`
- **Swagger Documentation**: `http://localhost:6000/api/docs`

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
# Frontend dependencies
npm install

# Python backend dependencies
pip install fastapi uvicorn
```

### 2. Run Application

#### Option A: One-Command Runner (Backend on 6000 + Frontend on 6100)
```bash
python3 main.py
```
*or via npm:*
```bash
npm run dev:all
```

#### Option B: Run Services Separately
```bash
# Terminal 1 - Run Backend (Port 6000)
npm run dev:backend

# Terminal 2 - Run Frontend (Port 6100)
npm run dev:frontend
```

---

## 📁 Project Structure

```
├── main.py                     # Root runner: runs FastAPI (6000) and Vite (6100)
├── backend/
│   ├── main.py                 # Backend entrypoint (Port 6000)
│   ├── server.py               # FastAPI REST API & routes
│   ├── database.py             # SQLite schema, migrations & seed data
│   └── requirements.txt        # Python libraries list
├── front-end/
│   ├── package.json            # Frontend npm scripts & dependencies
│   ├── vite.config.ts          # Vite configuration (Port 6100 & NAT settings)
│   ├── index.html              # Frontend HTML entrypoint
│   └── src/                    # React components, Kanban board, state & API
│       ├── App.tsx             # Main React app & auth gate
│       ├── api.ts              # API client connecting to FastAPI
│       ├── types.ts            # TypeScript interfaces
│       └── components/         # Kanban board, modals & login
├── package.json                # Root scripts
└── README.md
```

---

## 📄 License
Apache-2.0
