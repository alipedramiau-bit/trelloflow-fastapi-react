"""
TrelloFlow SQLite Database Layer with complete schema & seed data
"""
import sqlite3
import os
import uuid
import json
from datetime import datetime, timedelta

DB_PATH = os.environ.get("TRELLO_DB_PATH", os.path.join(os.path.dirname(__file__), "trello.db"))

def get_connection():
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS boards (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        background TEXT NOT NULL,
        is_starred INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lists (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL,
        title TEXT NOT NULL,
        position REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL,
        list_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        position REAL NOT NULL DEFAULT 0,
        due_date TEXT,
        is_completed INTEGER NOT NULL DEFAULT 0,
        cover_color TEXT,
        cover_image TEXT,
        members TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
        FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS labels (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS card_labels (
        card_id TEXT NOT NULL,
        label_id TEXT NOT NULL,
        PRIMARY KEY (card_id, label_id),
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
        FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS checklists (
        id TEXT PRIMARY KEY,
        card_id TEXT NOT NULL,
        title TEXT NOT NULL,
        position REAL NOT NULL DEFAULT 0,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS checklist_items (
        id TEXT PRIMARY KEY,
        checklist_id TEXT NOT NULL,
        text TEXT NOT NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        position REAL NOT NULL DEFAULT 0,
        FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        card_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_avatar TEXT NOT NULL DEFAULT '',
        text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL,
        card_id TEXT,
        user_name TEXT NOT NULL,
        action_text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        display_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        avatar TEXT NOT NULL DEFAULT 'AP',
        created_at TEXT NOT NULL
    );
    """)

    # Ensure AdminParsa exists
    cursor.execute("SELECT id FROM users WHERE username = ?", ("AdminParsa",))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT OR REPLACE INTO users (id, username, password, display_name, role, avatar, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (str(uuid.uuid4()), "AdminParsa", "Parsa@1405", "پارسا (مدیر سیستم)", "admin", "AP", datetime.utcnow().isoformat()))

    conn.commit()

    # Check if boards exist; if not, seed realistic data
    cursor.execute("SELECT COUNT(*) FROM boards")
    count = cursor.fetchone()[0]
    if count == 0:
        seed_sample_data(conn)

    conn.close()

def seed_sample_data(conn):
    cursor = conn.cursor()
    now = datetime.utcnow()

    # Board 1: Product Roadmap & Sprint 14
    b1_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO boards (id, title, background, is_starred, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (b1_id, "🚀 اسپرینت توسعه محصول (Sprint 14)", "ocean", 1, now.isoformat(), now.isoformat()))

    # Labels for Board 1
    labels_b1 = [
        ("lbl_bug", "باگ بحرانی", "#ef4444"),       # red
        ("lbl_feat", "قابلیت جدید", "#3b82f6"),      # blue
        ("lbl_ui", "رابط کاربری", "#10b981"),        # green
        ("lbl_backend", "بک‌اند پایتون", "#8b5cf6"), # purple
        ("lbl_perf", "بهینه‌سازی کارایی", "#f59e0b"), # amber
    ]
    for lid, name, color in labels_b1:
        cursor.execute("INSERT INTO labels (id, board_id, name, color) VALUES (?, ?, ?, ?)",
                       (lid, b1_id, name, color))

    # Lists for Board 1
    lists_b1 = [
        ("list_todo", "کارهای آینده (To Do)", 1000),
        ("list_prog", "در حال انجام (In Progress)", 2000),
        ("list_rev", "بررسی و آزمون (Code Review)", 3000),
        ("list_done", "انجام شده (Done)", 4000),
    ]
    for lid, title, pos in lists_b1:
        cursor.execute("INSERT INTO lists (id, board_id, title, position, created_at) VALUES (?, ?, ?, ?, ?)",
                       (lid, b1_id, title, pos, now.isoformat()))

    # Cards for To Do
    c1 = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO cards (id, board_id, list_id, title, description, position, due_date, is_completed, cover_color, members, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        c1, b1_id, "list_todo",
        "طراحی سیستم اعلان‌های فوری (Real-time Notifications)",
        "پیاده‌سازی ماژول ارسال پیام‌های لحظه‌ای و نوتیفیکیشن دسکتاپ هنگام تغییر وضعیت کارت‌ها و منشن شدن اعضای تیم.",
        1000,
        (now + timedelta(days=3)).strftime("%Y-%m-%d"),
        0,
        "#3b82f6",
        json.dumps([{"name": "علی رضایی", "avatar": "AR", "color": "bg-indigo-600"}]),
        now.isoformat(), now.isoformat()
    ))
    cursor.execute("INSERT INTO card_labels (card_id, label_id) VALUES (?, ?)", (c1, "lbl_feat"))
    cursor.execute("INSERT INTO card_labels (card_id, label_id) VALUES (?, ?)", (c1, "lbl_backend"))

    # Checklist for c1
    chk1 = str(uuid.uuid4())
    cursor.execute("INSERT INTO checklists (id, card_id, title, position) VALUES (?, ?, ?, ?)",
                   (chk1, c1, "مراحل پیاده‌سازی سرویس اعلان", 1000))
    items_chk1 = [
        ("طراحی اندپوینت‌های SSE/Websocket در پایتون", 1, 1000),
        ("ایجاد کامپوننت Toast در فرانت‌اند با Motion", 1, 2000),
        ("تنظیم دیتابیس نوتیفیکیشن‌ها در SQLite", 0, 3000),
        ("تست با سناریوهای چندکاربره همزمان", 0, 4000),
    ]
    for itext, is_comp, ipos in items_chk1:
        cursor.execute("INSERT INTO checklist_items (id, checklist_id, text, is_completed, position) VALUES (?, ?, ?, ?, ?)",
                       (str(uuid.uuid4()), chk1, itext, is_comp, ipos))

    # Comments for c1
    cursor.execute("""
        INSERT INTO comments (id, card_id, author_name, author_avatar, text, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        str(uuid.uuid4()), c1, "سارا کاظمی", "SK",
        "پیشنهاد می‌کنم برای لاگ‌ها از ساختار استاندارد JSON استفاده کنیم تا دیباگ آسان‌تر باشد.",
        (now - timedelta(hours=2)).isoformat()
    ))

    # Card 2 in To Do
    c2 = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO cards (id, board_id, list_id, title, description, position, due_date, is_completed, cover_color, members, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        c2, b1_id, "list_todo",
        "تست نفوذ امنیتی اندپوینت‌های API و احراز هویت",
        "بررسی ولیدیشن ورودی‌های JSON، بررسی اسکریپت‌های مخرب XSS و مهار خطاهای دیتابیس.",
        2000,
        (now + timedelta(days=5)).strftime("%Y-%m-%d"),
        0,
        None,
        json.dumps([{"name": "محمد احمدی", "avatar": "MA", "color": "bg-emerald-600"}]),
        now.isoformat(), now.isoformat()
    ))
    cursor.execute("INSERT INTO card_labels (card_id, label_id) VALUES (?, ?)", (c2, "lbl_bug"))

    # Cards in Progress
    c3 = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO cards (id, board_id, list_id, title, description, position, due_date, is_completed, cover_color, members, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        c3, b1_id, "list_prog",
        "بهینه‌سازی Drag & Drop کارت‌ها و افکت‌های حرکتی",
        "استفاده از ترنزیشن‌های نرم و طبیعی هنگام کشیدن و رها کردن ستون‌ها و کارت‌ها با بازخورد بصری و هایلایت مقصد.",
        1000,
        (now + timedelta(days=1)).strftime("%Y-%m-%d"),
        0,
        "#10b981",
        json.dumps([
            {"name": "علی رضایی", "avatar": "AR", "color": "bg-indigo-600"},
            {"name": "نیلوفر مهرابی", "avatar": "NM", "color": "bg-rose-600"}
        ]),
        now.isoformat(), now.isoformat()
    ))
    cursor.execute("INSERT INTO card_labels (card_id, label_id) VALUES (?, ?)", (c3, "lbl_ui"))
    cursor.execute("INSERT INTO card_labels (card_id, label_id) VALUES (?, ?)", (c3, "lbl_perf"))

    chk2 = str(uuid.uuid4())
    cursor.execute("INSERT INTO checklists (id, card_id, title, position) VALUES (?, ?, ?, ?)",
                   (chk2, c3, "کارهای تکمیلی درگ و دراپ", 1000))
    items_chk2 = [
        ("پشتیبانی از لمس و موبایل با تاچ هندلر", 1, 1000),
        ("محاسبه خودکار اندیس و شناور ماندن جایگاه رهاسازی", 1, 2000),
        ("انیمیشن نرم ورود و خروج با Tailwind CSS", 1, 3000),
    ]
    for itext, is_comp, ipos in items_chk2:
        cursor.execute("INSERT INTO checklist_items (id, checklist_id, text, is_completed, position) VALUES (?, ?, ?, ?, ?)",
                       (str(uuid.uuid4()), chk2, itext, is_comp, ipos))

    # Card in Code Review
    c4 = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO cards (id, board_id, list_id, title, description, position, due_date, is_completed, cover_color, members, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        c4, b1_id, "list_rev",
        "پیاده‌سازی بک‌اند پایتون و همگام‌سازی دیتابیس SQLite",
        "معماری RESTful تمیز و سریع با پایتون با مدل‌سازی جامع تخته‌ها، لیست‌ها، کارت‌ها و لاگ فعالیت‌ها.",
        1000,
        now.strftime("%Y-%m-%d"),
        1,
        "#8b5cf6",
        json.dumps([{"name": "علی رضایی", "avatar": "AR", "color": "bg-indigo-600"}]),
        now.isoformat(), now.isoformat()
    ))
    cursor.execute("INSERT INTO card_labels (card_id, label_id) VALUES (?, ?)", (c4, "lbl_backend"))

    # Card in Done
    c5 = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO cards (id, board_id, list_id, title, description, position, due_date, is_completed, cover_color, members, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        c5, b1_id, "list_done",
        "کانفیگ اولیه Vite و Tailwind CSS نسخه جدید",
        "پیکربندی استایل‌ها، متغیرهای محیطی و راه‌اندازی تایپ‌اسکریپت و ماژول رندرینگ واکنشی.",
        1000,
        (now - timedelta(days=2)).strftime("%Y-%m-%d"),
        1,
        "#f59e0b",
        json.dumps([{"name": "سارا کاظمی", "avatar": "SK", "color": "bg-amber-600"}]),
        now.isoformat(), now.isoformat()
    ))
    cursor.execute("INSERT INTO card_labels (card_id, label_id) VALUES (?, ?)", (c5, "lbl_feat"))

    # Initial Activities
    acts = [
        (b1_id, c4, "علی رضایی", "کارت «پیاده‌سازی بک‌اند پایتون» را به بررسی منتقل کرد", (now - timedelta(hours=1)).isoformat()),
        (b1_id, c3, "نیلوفر مهرابی", "یک آیتم به چک‌لیست اضافه کرد", (now - timedelta(hours=3)).isoformat()),
        (b1_id, c1, "سارا کاظمی", "یک نظر روی کارت ثبت کرد", (now - timedelta(hours=5)).isoformat()),
        (b1_id, None, "مدیر سیستم", "تخته «اسپرینت توسعه محصول» را ایجاد کرد", (now - timedelta(days=1)).isoformat()),
    ]
    for bid, cid, user, txt, ctime in acts:
        cursor.execute("""
            INSERT INTO activities (id, board_id, card_id, user_name, action_text, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (str(uuid.uuid4()), bid, cid, user, txt, ctime))

    # Board 2: Marketing & Growth
    b2_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO boards (id, title, background, is_starred, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (b2_id, "📈 کمپین دیجیتال مارکتینگ و رشد", "sunset", 0, now.isoformat(), now.isoformat()))
    
    # Lists for Board 2
    l2_1 = str(uuid.uuid4())
    l2_2 = str(uuid.uuid4())
    cursor.execute("INSERT INTO lists (id, board_id, title, position, created_at) VALUES (?, ?, ?, ?, ?)",
                   (l2_1, b2_id, "ایده‌های محتوایی", 1000, now.isoformat()))
    cursor.execute("INSERT INTO lists (id, board_id, title, position, created_at) VALUES (?, ?, ?, ?, ?)",
                   (l2_2, b2_id, "آماده انتشار", 2000, now.isoformat()))
    
    c_m1 = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO cards (id, board_id, list_id, title, description, position, due_date, is_completed, cover_color, members, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        c_m1, b2_id, l2_1,
        "نگارش راهنمای جامع کار با بورد ترلو و متدلوژی کانبان",
        "تولید مقاله تخصصی برای بلاگ درباره اصول مدیریت تسک با متدولوژی چابک (Agile) و ابزارهای بصری.",
        1000,
        (now + timedelta(days=4)).strftime("%Y-%m-%d"),
        0,
        "#ec4899",
        json.dumps([{"name": "مریم حسینی", "avatar": "MH", "color": "bg-pink-600"}]),
        now.isoformat(), now.isoformat()
    ))

    conn.commit()
