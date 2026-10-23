export interface User {
  id: string;
  username: string;
  display_name: string;
  role: string;
  avatar: string;
  color?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface Member {
  name: string;
  avatar: string;
  color: string;
}

export interface Label {
  id: string;
  board_id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  text: string;
  is_completed: number;
  position: number;
}

export interface Checklist {
  id: string;
  card_id: string;
  title: string;
  position: number;
  items: ChecklistItem[];
}

export interface Comment {
  id: string;
  card_id: string;
  author_name: string;
  author_avatar: string;
  text: string;
  created_at: string;
}

export interface Activity {
  id: string;
  board_id: string;
  card_id?: string | null;
  user_name: string;
  action_text: string;
  created_at: string;
}

export interface Card {
  id: string;
  board_id: string;
  list_id: string;
  title: string;
  description: string;
  position: number;
  due_date: string | null;
  due_date_jalali?: string | null;
  is_completed: number;
  cover_color: string | null;
  cover_image: string | null;
  members: Member[];
  created_at: string;
  updated_at: string;
  labels: Label[];
  checklist_stats: {
    total: number;
    completed: number;
  };
  comment_count: number;
  checklists?: Checklist[];
  comments?: Comment[];
  activities?: Activity[];
}

export interface List {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  background: string;
  is_starred: number;
  created_at: string;
  updated_at: string;
  list_count?: number;
  card_count?: number;
  lists?: List[];
  labels?: Label[];
  activities?: Activity[];
}

export interface FilterState {
  search: string;
  labelIds: string[];
  dueStatus: 'all' | 'overdue' | 'today' | 'completed' | 'nodate';
}

// Served by GET /api/utils/jalali-meta (backend: jdatetime library)
export interface JalaliMeta {
  today_jalali: string;
  today_iso: string;
  leap_years: number[];
}

export type ThemeBackground = 'ocean' | 'sunset' | 'forest' | 'midnight' | 'lavender' | 'amber';

export interface BackgroundThemeConfig {
  id: ThemeBackground;
  nameFa: string;
  nameEn: string;
  gradientClass: string;
  headerClass: string;
  accentColor: string;
}
