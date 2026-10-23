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
├── main.py                 # Main entrypoint: runs FastAPI on 6000 and Vite on 6100
├── backend/
│   ├── server.py           # FastAPI REST API endpoints & Uvicorn runner
│   └── database.py         # SQLite schema, migrations & seed data
├── src/
│   ├── App.tsx             # Main React application & state management
│   ├── api.ts              # API client communicating with FastAPI
│   ├── types.ts            # TypeScript definitions for Boards, Cards, Lists
│   ├── translations.ts     # Persian & English translations and themes
│   └── components/
│       ├── LoginScreen.tsx       # Auth screen with AdminParsa credentials
│       ├── Header.tsx            # Top bar, board switcher, theme picker
│       ├── BoardView.tsx         # Kanban board layout with drag & drop
│       ├── ListColumn.tsx        # Column with quick add and card drop zone
│       ├── CardItem.tsx          # Card tile with badges & progress
│       ├── CardDetailModal.tsx   # Comprehensive card modal
│       ├── ActivityDrawer.tsx    # Slide-over audit history
│       ├── FilterModal.tsx       # Multi-criteria card filtering
│       └── ExportImportModal.tsx # JSON backup & restore
├── package.json            # Scripts & npm dependencies
└── vite.config.ts          # Vite configuration with port 6100 & API proxy
```

---

## 📄 License
Apache-2.0
