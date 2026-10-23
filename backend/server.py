"""
TrelloFlow FastAPI REST API Server with Uvicorn
Modern, high-performance async Python backend with SQLite persistence
"""
import sys
import os
import uuid
import json
from typing import Optional, List, Dict, Any
from datetime import datetime, date

import jdatetime

from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))
from database import get_connection, init_db, seed_sample_data

app = FastAPI(
    title="TrelloFlow API",
    description="High-performance FastAPI backend for Trello Kanban Clone",
    version="2.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# --- Helper functions ---
def log_activity(conn, board_id: str, card_id: Optional[str], user_name: str, action_text: str):
    try:
        conn.execute("""
            INSERT INTO activities (id, board_id, card_id, user_name, action_text, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (str(uuid.uuid4()), board_id, card_id, user_name, action_text, datetime.utcnow().isoformat()))
        conn.commit()
    except Exception as e:
        print("Error logging activity:", e)

# --- Jalali (Shamsi) calendar helpers ---
# Due dates are stored as ISO Gregorian strings. The Jalali representation is
# derived with the `jdatetime` library (see requirements.txt) and exposed to
# the UI as `due_date_jalali` on every card payload. The frontend picker sends
# `due_date_jalali` ("1404/08/15") and the backend converts it back to ISO.

def iso_to_jalali(value):
    """""Convert a stored ISO date/datetime string to a Jalali string.

    "2025-11-06" -> "1404/08/15". A time part (HH:MM) is preserved when it is
    meaningful (not midnight). Returns None for empty/invalid values.
    """""
    if not value:
        return None
    try:
        s = str(value).strip()
        if "T" in s:
            date_part, time_part = s.split("T", 1)
        elif " " in s:
            date_part, time_part = s.split(" ", 1)
        else:
            date_part, time_part = s, None
        g = date.fromisoformat(date_part)
        j = jdatetime.date.fromgregorian(date=g)
        out = "%d/%02d/%02d" % (j.year, j.month, j.day)
        if time_part and not str(time_part).startswith("00:00"):
            out += " " + ":".join(str(time_part).split(":")[:2])
        return out
    except Exception:
        return None

def jalali_to_iso(value):
    """""Convert a Jalali string ("1404/08/15" optionally with "HH:MM") to ISO.

    jdatetime validates the date, so impossible combinations (e.g. day 31 of
    Mehr, or Esfand 30 in a non-leap year) raise ValueError.
    """""
    s = str(value).strip()
    chunks = s.split()
    if not chunks:
        raise ValueError("Empty Jalali date")
    ymd = chunks[0].replace("-", "/").split("/")
    if len(ymd) != 3:
        raise ValueError("Invalid Jalali date: %s" % value)
    y, m, d = int(ymd[0]), int(ymd[1]), int(ymd[2])
    j = jdatetime.date(y, m, d)
    iso = j.togregorian().isoformat()
    if len(chunks) > 1:
        iso += "T" + chunks[1]
    return iso

def attach_jalali(card):
    """""Attach the Jalali representation of due_date to a card dict."""""
    if card is not None:
        card["due_date_jalali"] = iso_to_jalali(card.get("due_date"))
    return card

# --- Pydantic Schemas ---
class BoardCreate(BaseModel):
    title: str
    background: Optional[str] = "ocean"
    user_name: Optional[str] = "کاربر"

class BoardUpdate(BaseModel):
    title: Optional[str] = None
    background: Optional[str] = None
    is_starred: Optional[int] = None

class ListCreate(BaseModel):
    title: str
    user_name: Optional[str] = "کاربر"

class ListUpdate(BaseModel):
    title: Optional[str] = None
    position: Optional[float] = None

class CardCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    due_date: Optional[str] = None
    due_date_jalali: Optional[str] = None
    cover_color: Optional[str] = None
    members: Optional[List[Dict[str, Any]]] = []
    user_name: Optional[str] = "کاربر"

class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    due_date_jalali: Optional[str] = None
    is_completed: Optional[int] = None
    cover_color: Optional[str] = None
    members: Optional[List[Dict[str, Any]]] = None
    user_name: Optional[str] = "کاربر"

class CardMove(BaseModel):
    target_list_id: str
    new_position: float
    user_name: Optional[str] = "کاربر"

class LabelToggle(BaseModel):
    label_id: str

class LabelCreate(BaseModel):
    name: str
    color: str = "#3b82f6"

class ChecklistCreate(BaseModel):
    title: str

class ChecklistUpdate(BaseModel):
    title: str

class ChecklistItemCreate(BaseModel):
    text: str

class ChecklistItemUpdate(BaseModel):
    text: Optional[str] = None
    is_completed: Optional[int] = None

class CommentCreate(BaseModel):
    text: str
    author_name: Optional[str] = "کاربر"
    author_avatar: Optional[str] = "KU"

class LoginRequest(BaseModel):
    username: str
    password: str

# --- Endpoints ---

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "backend": "fastapi",
        "framework": "FastAPI + Uvicorn",
        "version": sys.version.split()[0],
        "server": "TrelloFlow FastAPI Server"
    }

@app.get("/api/utils/jalali-meta")
def jalali_meta(from_year: int = 1390, to_year: int = 1430):
    """Jalali calendar metadata for the frontend due-date picker.

    Returns today in Shamsi plus the leap years of the requested range so the
    UI can compute Esfand's length (29 or 30 days) without duplicating the
    algorithm in JavaScript.
    """
    from_year = max(1178, min(from_year, to_year - 1))
    to_year = min(1633, max(to_year, from_year + 1))
    today_g = date.today()
    today_j = jdatetime.date.fromgregorian(date=today_g)
    leap_years = []
    for y in range(from_year, to_year + 1):
        try:
            if jdatetime.date(y, 1, 1).isleap():
                leap_years.append(y)
        except Exception:
            continue
    return {
        "today_jalali": "%d/%02d/%02d" % (today_j.year, today_j.month, today_j.day),
        "today_iso": today_g.isoformat(),
        "leap_years": leap_years,
    }

# --- Authentication ---

@app.post("/api/auth/login")
def login(payload: LoginRequest):
    username = payload.username.strip()
    password = payload.password.strip()

    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE LOWER(username) = LOWER(?)", (username,))
        user_row = cursor.fetchone()

        if user_row and user_row["password"] == password:
            user = dict(user_row)
            del user["password"]
            return {
                "success": True,
                "token": f"token-admin-{user['id']}",
                "user": user
            }

        # Check default admin credential requested by user
        if username.lower() == "adminparsa" and password == "Parsa@1405":
            admin_user = {
                "id": "admin_parsa",
                "username": "AdminParsa",
                "display_name": "پارسا (مدیر سیستم)",
                "role": "admin",
                "avatar": "AP",
                "color": "bg-indigo-600"
            }
            return {
                "success": True,
                "token": "token-admin-parsa-1405",
                "user": admin_user
            }

        raise HTTPException(status_code=401, detail="نام کاربری یا رمز عبور اشتباه است")
    finally:
        conn.close()

@app.get("/api/auth/me")
def get_current_user():
    return {
        "id": "admin_parsa",
        "username": "AdminParsa",
        "display_name": "پارسا (مدیر سیستم)",
        "role": "admin",
        "avatar": "AP"
    }

# --- Boards ---

@app.get("/api/boards")
def get_boards():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT b.*, 
                   (SELECT COUNT(*) FROM lists WHERE board_id = b.id) as list_count,
                   (SELECT COUNT(*) FROM cards WHERE board_id = b.id) as card_count
            FROM boards b
            ORDER BY b.is_starred DESC, b.created_at DESC
        """)
        return [dict(r) for r in cursor.fetchall()]
    finally:
        conn.close()

@app.post("/api/boards", status_code=201)
def create_board(payload: BoardCreate):
    conn = get_connection()
    try:
        now = datetime.utcnow().isoformat()
        board_id = str(uuid.uuid4())
        title = payload.title.strip() or "تخته بدون عنوان"
        background = payload.background or "ocean"

        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO boards (id, title, background, is_starred, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (board_id, title, background, 0, now, now))

        # Create default lists
        default_lists = [
            ("کارهای آینده (To Do)", 1000),
            ("در حال انجام (In Progress)", 2000),
            ("انجام شده (Done)", 3000),
        ]
        for ltitle, lpos in default_lists:
            cursor.execute("""
                INSERT INTO lists (id, board_id, title, position, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (str(uuid.uuid4()), board_id, ltitle, lpos, now))

        # Default labels
        default_labels = [
            ("فوری و مهم", "#ef4444"),
            ("در حال پیگیری", "#3b82f6"),
            ("تکمیل شده", "#10b981"),
            ("نیازمند بررسی", "#f59e0b"),
            ("ایده جدید", "#8b5cf6"),
        ]
        for lname, lcol in default_labels:
            cursor.execute("""
                INSERT INTO labels (id, board_id, name, color)
                VALUES (?, ?, ?, ?)
            """, (str(uuid.uuid4()), board_id, lname, lcol))

        log_activity(conn, board_id, None, payload.user_name or "کاربر", f"تخته «{title}» را ایجاد کرد")
        conn.commit()

        cursor.execute("SELECT * FROM boards WHERE id = ?", (board_id,))
        return dict(cursor.fetchone())
    finally:
        conn.close()

@app.get("/api/boards/{board_id}")
def get_board(board_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM boards WHERE id = ?", (board_id,))
        b_row = cursor.fetchone()
        if not b_row:
            raise HTTPException(status_code=404, detail="Board not found")

        board = dict(b_row)

        # Labels for board
        cursor.execute("SELECT * FROM labels WHERE board_id = ? ORDER BY name ASC", (board_id,))
        board["labels"] = [dict(r) for r in cursor.fetchall()]

        # Lists for board
        cursor.execute("SELECT * FROM lists WHERE board_id = ? ORDER BY position ASC, created_at ASC", (board_id,))
        lists = [dict(r) for r in cursor.fetchall()]

        # Cards for board
        cursor.execute("""
            SELECT c.* 
            FROM cards c
            WHERE c.board_id = ?
            ORDER BY c.position ASC, c.created_at ASC
        """, (board_id,))
        card_rows = cursor.fetchall()
        cards_by_list = {l["id"]: [] for l in lists}

        # Labels map
        cursor.execute("""
            SELECT cl.card_id, l.id, l.id as label_id, l.board_id, l.name, l.color
            FROM card_labels cl
            JOIN labels l ON cl.label_id = l.id
            JOIN cards c ON cl.card_id = c.id
            WHERE c.board_id = ?
        """, (board_id,))
        labels_map = {}
        for r in cursor.fetchall():
            labels_map.setdefault(r["card_id"], []).append(dict(r))

        # Checklist stats
        cursor.execute("""
            SELECT chk.card_id, 
                   COUNT(item.id) as total_items,
                   SUM(CASE WHEN item.is_completed = 1 THEN 1 ELSE 0 END) as completed_items
            FROM checklists chk
            JOIN cards c ON chk.card_id = c.id
            LEFT JOIN checklist_items item ON item.checklist_id = chk.id
            WHERE c.board_id = ?
            GROUP BY chk.card_id
        """, (board_id,))
        checklist_stats = {}
        for r in cursor.fetchall():
            checklist_stats[r["card_id"]] = {
                "total": r["total_items"] or 0,
                "completed": r["completed_items"] or 0
            }

        # Comments count
        cursor.execute("""
            SELECT c.id as card_id, COUNT(cm.id) as comment_count
            FROM cards c
            LEFT JOIN comments cm ON cm.card_id = c.id
            WHERE c.board_id = ?
            GROUP BY c.id
        """, (board_id,))
        comment_counts = {r["card_id"]: r["comment_count"] for r in cursor.fetchall()}

        for cr in card_rows:
            card = dict(cr)
            try:
                card["members"] = json.loads(card["members"])
            except Exception:
                card["members"] = []
            card["labels"] = labels_map.get(card["id"], [])
            card["checklist_stats"] = checklist_stats.get(card["id"], {"total": 0, "completed": 0})
            card["comment_count"] = comment_counts.get(card["id"], 0)
            attach_jalali(card)

            if card["list_id"] in cards_by_list:
                cards_by_list[card["list_id"]].append(card)

        for l in lists:
            l["cards"] = cards_by_list.get(l["id"], [])

        board["lists"] = lists

        # Activities
        cursor.execute("SELECT * FROM activities WHERE board_id = ? ORDER BY created_at DESC LIMIT 30", (board_id,))
        board["activities"] = [dict(r) for r in cursor.fetchall()]

        return board
    finally:
        conn.close()

@app.put("/api/boards/{board_id}")
def update_board(board_id: str, payload: BoardUpdate):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM boards WHERE id = ?", (board_id,))
        current = cursor.fetchone()
        if not current:
            raise HTTPException(status_code=404, detail="Board not found")

        title = payload.title if payload.title is not None else current["title"]
        background = payload.background if payload.background is not None else current["background"]
        is_starred = payload.is_starred if payload.is_starred is not None else current["is_starred"]
        now = datetime.utcnow().isoformat()

        cursor.execute("""
            UPDATE boards SET title = ?, background = ?, is_starred = ?, updated_at = ?
            WHERE id = ?
        """, (title, background, is_starred, now, board_id))
        conn.commit()

        cursor.execute("SELECT * FROM boards WHERE id = ?", (board_id,))
        return dict(cursor.fetchone())
    finally:
        conn.close()

@app.delete("/api/boards/{board_id}")
def delete_board(board_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM boards WHERE id = ?", (board_id,))
        conn.commit()
        return {"success": True, "id": board_id}
    finally:
        conn.close()

# --- Lists ---

@app.post("/api/boards/{board_id}/lists", status_code=201)
def create_list(board_id: str, payload: ListCreate):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT MAX(position) FROM lists WHERE board_id = ?", (board_id,))
        max_pos = cursor.fetchone()[0] or 0
        new_pos = max_pos + 1000

        list_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        title = payload.title.strip() or "لیست جدید"

        cursor.execute("""
            INSERT INTO lists (id, board_id, title, position, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (list_id, board_id, title, new_pos, now))

        log_activity(conn, board_id, None, payload.user_name or "کاربر", f"لیست «{title}» را به تخته افزود")
        conn.commit()

        cursor.execute("SELECT * FROM lists WHERE id = ?", (list_id,))
        new_list = dict(cursor.fetchone())
        new_list["cards"] = []
        return new_list
    finally:
        conn.close()

@app.put("/api/lists/{list_id}")
def update_list(list_id: str, payload: ListUpdate):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM lists WHERE id = ?", (list_id,))
        current = cursor.fetchone()
        if not current:
            raise HTTPException(status_code=404, detail="List not found")

        title = payload.title if payload.title is not None else current["title"]
        position = payload.position if payload.position is not None else current["position"]

        cursor.execute("UPDATE lists SET title = ?, position = ? WHERE id = ?", (title, position, list_id))
        conn.commit()

        cursor.execute("SELECT * FROM lists WHERE id = ?", (list_id,))
        return dict(cursor.fetchone())
    finally:
        conn.close()

@app.delete("/api/lists/{list_id}")
def delete_list(list_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM lists WHERE id = ?", (list_id,))
        conn.commit()
        return {"success": True, "id": list_id}
    finally:
        conn.close()

# --- Cards ---

@app.post("/api/lists/{list_id}/cards", status_code=201)
def create_card(list_id: str, payload: CardCreate):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT board_id, title FROM lists WHERE id = ?", (list_id,))
        l_row = cursor.fetchone()
        if not l_row:
            raise HTTPException(status_code=404, detail="List not found")

        board_id = l_row["board_id"]
        list_title = l_row["title"]

        cursor.execute("SELECT MAX(position) FROM cards WHERE list_id = ?", (list_id,))
        max_pos = cursor.fetchone()[0] or 0
        new_pos = max_pos + 1000

        card_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        title = payload.title.strip()
        members_json = json.dumps(payload.members or [])

        # Jalali input wins when provided (the UI date picker is Shamsi)
        due_date = payload.due_date
        if payload.due_date_jalali is not None:
            try:
                due_date = jalali_to_iso(payload.due_date_jalali)
            except (ValueError, IndexError) as exc:
                raise HTTPException(status_code=400, detail="تاریخ جلالی نامعتبر است: %s" % exc)

        cursor.execute("""
            INSERT INTO cards (id, board_id, list_id, title, description, position, due_date, is_completed, cover_color, cover_image, members, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (card_id, board_id, list_id, title, payload.description or "", new_pos, due_date, 0, payload.cover_color, None, members_json, now, now))

        log_activity(conn, board_id, card_id, payload.user_name or "کاربر", f"کارت «{title}» را در لیست «{list_title}» ایجاد کرد")
        conn.commit()

        cursor.execute("SELECT * FROM cards WHERE id = ?", (card_id,))
        card = dict(cursor.fetchone())
        card["members"] = json.loads(card["members"])
        card["labels"] = []
        card["checklist_stats"] = {"total": 0, "completed": 0}
        card["comment_count"] = 0
        return attach_jalali(card)
    finally:
        conn.close()

@app.get("/api/cards/{card_id}")
def get_card(card_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cards WHERE id = ?", (card_id,))
        c_row = cursor.fetchone()
        if not c_row:
            raise HTTPException(status_code=404, detail="Card not found")

        card = dict(c_row)
        try:
            card["members"] = json.loads(card["members"])
        except Exception:
            card["members"] = []

        # Labels
        cursor.execute("""
            SELECT l.* FROM labels l
            JOIN card_labels cl ON l.id = cl.label_id
            WHERE cl.card_id = ?
        """, (card_id,))
        card["labels"] = [dict(r) for r in cursor.fetchall()]

        # Checklists
        cursor.execute("SELECT * FROM checklists WHERE card_id = ? ORDER BY position ASC", (card_id,))
        checklists = [dict(r) for r in cursor.fetchall()]
        for chk in checklists:
            cursor.execute("SELECT * FROM checklist_items WHERE checklist_id = ? ORDER BY position ASC", (chk["id"],))
            chk["items"] = [dict(r) for r in cursor.fetchall()]
        card["checklists"] = checklists

        # Comments
        cursor.execute("SELECT * FROM comments WHERE card_id = ? ORDER BY created_at DESC", (card_id,))
        card["comments"] = [dict(r) for r in cursor.fetchall()]

        # Activities
        cursor.execute("SELECT * FROM activities WHERE card_id = ? ORDER BY created_at DESC LIMIT 20", (card_id,))
        card["activities"] = [dict(r) for r in cursor.fetchall()]

        return attach_jalali(card)
    finally:
        conn.close()

@app.put("/api/cards/{card_id}")
def update_card(card_id: str, payload: CardUpdate):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cards WHERE id = ?", (card_id,))
        current = cursor.fetchone()
        if not current:
            raise HTTPException(status_code=404, detail="Card not found")

        # PATCH semantics: only overwrite fields that were actually sent in
        # the request body. model_fields_set tells "field sent as null"
        # (explicitly clear the value, e.g. removing a due date) apart from
        # "field omitted" (keep the stored value). The previous
        # "is not None" checks silently ignored null and made it impossible
        # to clear due_date / cover_color from the UI.
        sent = payload.model_fields_set
        title = payload.title if "title" in sent else current["title"]
        description = payload.description if "description" in sent else current["description"]
        due_date = payload.due_date if "due_date" in sent else current["due_date"]
        # Shamsi picker: when due_date_jalali is sent it overrides due_date.
        # Sending null explicitly clears the due date.
        if "due_date_jalali" in sent:
            if payload.due_date_jalali is None:
                due_date = None
            else:
                try:
                    due_date = jalali_to_iso(payload.due_date_jalali)
                except (ValueError, IndexError) as exc:
                    raise HTTPException(status_code=400, detail="تاریخ جلالی نامعتبر است: %s" % exc)
        is_completed = payload.is_completed if "is_completed" in sent else current["is_completed"]
        cover_color = payload.cover_color if "cover_color" in sent else current["cover_color"]
        
        members = current["members"]
        if "members" in sent and payload.members is not None:
            members = json.dumps(payload.members)

        now = datetime.utcnow().isoformat()

        cursor.execute("""
            UPDATE cards 
            SET title = ?, description = ?, due_date = ?, is_completed = ?, 
                cover_color = ?, members = ?, updated_at = ?
            WHERE id = ?
        """, (title, description, due_date, is_completed, cover_color, members, now, card_id))

        if title != current["title"]:
            log_activity(conn, current["board_id"], card_id, payload.user_name or "کاربر", f"عنوان کارت را به «{title}» تغییر داد")

        conn.commit()

        cursor.execute("SELECT * FROM cards WHERE id = ?", (card_id,))
        updated_card = dict(cursor.fetchone())
        updated_card["members"] = json.loads(updated_card["members"])
        return attach_jalali(updated_card)
    finally:
        conn.close()

@app.delete("/api/cards/{card_id}")
def delete_card(card_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cards WHERE id = ?", (card_id,))
        conn.commit()
        return {"success": True, "id": card_id}
    finally:
        conn.close()

@app.post("/api/cards/{card_id}/move")
def move_card(card_id: str, payload: CardMove):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT c.*, l.title as list_title FROM cards c JOIN lists l ON c.list_id = l.id WHERE c.id = ?", (card_id,))
        c_row = cursor.fetchone()
        if not c_row:
            raise HTTPException(status_code=404, detail="Card not found")

        old_list_id = c_row["list_id"]
        board_id = c_row["board_id"]
        card_title = c_row["title"]
        now = datetime.utcnow().isoformat()

        cursor.execute("""
            UPDATE cards 
            SET list_id = ?, position = ?, updated_at = ?
            WHERE id = ?
        """, (payload.target_list_id, payload.new_position, now, card_id))

        if old_list_id != payload.target_list_id:
            cursor.execute("SELECT title FROM lists WHERE id = ?", (payload.target_list_id,))
            t_list = cursor.fetchone()
            t_title = t_list["title"] if t_list else ""
            log_activity(conn, board_id, card_id, payload.user_name or "کاربر", f"کارت «{card_title}» را به لیست «{t_title}» جابجا کرد")

        conn.commit()
        return {"success": True, "card_id": card_id, "list_id": payload.target_list_id, "position": payload.new_position}
    finally:
        conn.close()

# --- Labels ---

@app.post("/api/cards/{card_id}/labels")
def toggle_card_label(card_id: str, payload: LabelToggle):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM card_labels WHERE card_id = ? AND label_id = ?", (card_id, payload.label_id))
        exists = cursor.fetchone()
        if exists:
            cursor.execute("DELETE FROM card_labels WHERE card_id = ? AND label_id = ?", (card_id, payload.label_id))
            action = "removed"
        else:
            cursor.execute("INSERT INTO card_labels (card_id, label_id) VALUES (?, ?)", (card_id, payload.label_id))
            action = "added"
        conn.commit()
        return {"action": action, "card_id": card_id, "label_id": payload.label_id}
    finally:
        conn.close()

@app.post("/api/boards/{board_id}/labels", status_code=201)
def create_board_label(board_id: str, payload: LabelCreate):
    conn = get_connection()
    try:
        label_id = str(uuid.uuid4())
        name = payload.name.strip() or "برچسب"
        color = payload.color or "#3b82f6"
        cursor = conn.cursor()
        cursor.execute("INSERT INTO labels (id, board_id, name, color) VALUES (?, ?, ?, ?)", (label_id, board_id, name, color))
        conn.commit()
        return {"id": label_id, "board_id": board_id, "name": name, "color": color}
    finally:
        conn.close()

# --- Checklists ---

@app.post("/api/cards/{card_id}/checklists", status_code=201)
def create_checklist(card_id: str, payload: ChecklistCreate):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT MAX(position) FROM checklists WHERE card_id = ?", (card_id,))
        max_pos = cursor.fetchone()[0] or 0
        chk_id = str(uuid.uuid4())
        title = payload.title.strip() or "چک‌لیست"

        cursor.execute("INSERT INTO checklists (id, card_id, title, position) VALUES (?, ?, ?, ?)",
                       (chk_id, card_id, title, max_pos + 1000))
        conn.commit()
        return {"id": chk_id, "card_id": card_id, "title": title, "position": max_pos + 1000, "items": []}
    finally:
        conn.close()

@app.put("/api/checklists/{checklist_id}")
def update_checklist(checklist_id: str, payload: ChecklistUpdate):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE checklists SET title = ? WHERE id = ?", (payload.title, checklist_id))
        conn.commit()
        return {"id": checklist_id, "title": payload.title}
    finally:
        conn.close()

@app.delete("/api/checklists/{checklist_id}")
def delete_checklist(checklist_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM checklists WHERE id = ?", (checklist_id,))
        conn.commit()
        return {"success": True, "id": checklist_id}
    finally:
        conn.close()

@app.post("/api/checklists/{checklist_id}/items", status_code=201)
def create_checklist_item(checklist_id: str, payload: ChecklistItemCreate):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT MAX(position) FROM checklist_items WHERE checklist_id = ?", (checklist_id,))
        max_pos = cursor.fetchone()[0] or 0
        item_id = str(uuid.uuid4())

        cursor.execute("""
            INSERT INTO checklist_items (id, checklist_id, text, is_completed, position)
            VALUES (?, ?, ?, ?, ?)
        """, (item_id, checklist_id, payload.text.strip(), 0, max_pos + 1000))
        conn.commit()
        return {"id": item_id, "checklist_id": checklist_id, "text": payload.text, "is_completed": 0, "position": max_pos + 1000}
    finally:
        conn.close()

@app.put("/api/checklist_items/{item_id}")
def update_checklist_item(item_id: str, payload: ChecklistItemUpdate):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM checklist_items WHERE id = ?", (item_id,))
        current = cursor.fetchone()
        if not current:
            raise HTTPException(status_code=404, detail="Item not found")

        text = payload.text if payload.text is not None else current["text"]
        is_completed = payload.is_completed if payload.is_completed is not None else current["is_completed"]

        cursor.execute("UPDATE checklist_items SET text = ?, is_completed = ? WHERE id = ?", (text, is_completed, item_id))
        conn.commit()

        cursor.execute("SELECT * FROM checklist_items WHERE id = ?", (item_id,))
        return dict(cursor.fetchone())
    finally:
        conn.close()

@app.delete("/api/checklist_items/{item_id}")
def delete_checklist_item(item_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM checklist_items WHERE id = ?", (item_id,))
        conn.commit()
        return {"success": True, "id": item_id}
    finally:
        conn.close()

# --- Comments ---

@app.post("/api/cards/{card_id}/comments", status_code=201)
def create_comment(card_id: str, payload: CommentCreate):
    conn = get_connection()
    try:
        comment_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO comments (id, card_id, author_name, author_avatar, text, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (comment_id, card_id, payload.author_name, payload.author_avatar, payload.text, now))

        cursor.execute("SELECT board_id, title FROM cards WHERE id = ?", (card_id,))
        c_row = cursor.fetchone()
        if c_row:
            log_activity(conn, c_row["board_id"], card_id, payload.author_name, f"روی کارت «{c_row['title']}» نظر ثبت کرد")

        conn.commit()
        return {
            "id": comment_id,
            "card_id": card_id,
            "author_name": payload.author_name,
            "author_avatar": payload.author_avatar,
            "text": payload.text,
            "created_at": now
        }
    finally:
        conn.close()

@app.delete("/api/comments/{comment_id}")
def delete_comment(comment_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM comments WHERE id = ?", (comment_id,))
        conn.commit()
        return {"success": True, "id": comment_id}
    finally:
        conn.close()

# --- Activities ---

@app.get("/api/boards/{board_id}/activities")
def get_board_activities(board_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM activities WHERE board_id = ? ORDER BY created_at DESC LIMIT 50", (board_id,))
        return [dict(r) for r in cursor.fetchall()]
    finally:
        conn.close()

# --- Database Backup & Reset ---

@app.post("/api/reset-data")
def reset_database():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        for tbl in ["activities", "comments", "checklist_items", "checklists", "card_labels", "labels", "cards", "lists", "boards"]:
            cursor.execute(f"DELETE FROM {tbl}")
        seed_sample_data(conn)
        return {"success": True, "message": "Database reset and seeded with sample data"}
    finally:
        conn.close()

@app.get("/api/export")
def export_database():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        data = {}
        for tbl in ["boards", "lists", "cards", "labels", "card_labels", "checklists", "checklist_items", "comments", "activities"]:
            cursor.execute(f"SELECT * FROM {tbl}")
            data[tbl] = [dict(r) for r in cursor.fetchall()]
        return data
    finally:
        conn.close()

@app.post("/api/import")
def import_database(data: Dict[str, Any] = Body(...)):
    conn = get_connection()
    try:
        tables = ["boards", "lists", "cards", "labels", "card_labels", "checklists", "checklist_items", "comments", "activities"]
        cursor = conn.cursor()
        for tbl in reversed(tables):
            cursor.execute(f"DELETE FROM {tbl}")
        for tbl in tables:
            rows = data.get(tbl, [])
            if rows:
                cols = list(rows[0].keys())
                placeholders = ",".join(["?"] * len(cols))
                col_names = ",".join(cols)
                for r in rows:
                    vals = [r[c] for c in cols]
                    cursor.execute(f"INSERT OR REPLACE INTO {tbl} ({col_names}) VALUES ({placeholders})", vals)
        conn.commit()
        return {"success": True, "message": "Data imported successfully"}
    finally:
        conn.close()

if __name__ == "__main__":
    port = 6000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1].replace("--port=", ""))
        except ValueError:
            pass
    elif "PORT" in os.environ and os.environ.get("PYTHON_PORT"):
        port = int(os.environ["PYTHON_PORT"])
    print(f"🚀 Starting TrelloFlow FastAPI Server with Uvicorn on 0.0.0.0:{port}...", flush=True)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
