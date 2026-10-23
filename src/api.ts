import type { Board, Card, List, Label, Checklist, ChecklistItem, Comment, Activity, JalaliMeta } from './types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async login(username: string, password: string): Promise<import('./types').AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  },

  async getHealth(): Promise<{ status: string; backend: string; version: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async getBoards(): Promise<Board[]> {
    const res = await fetch(`${API_BASE}/boards`);
    return handleResponse(res);
  },

  async getBoard(boardId: string): Promise<Board> {
    const res = await fetch(`${API_BASE}/boards/${boardId}`);
    return handleResponse(res);
  },

  async createBoard(title: string, background: string = 'ocean'): Promise<Board> {
    const res = await fetch(`${API_BASE}/boards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, background, user_name: 'کاربر' }),
    });
    return handleResponse(res);
  },

  async updateBoard(boardId: string, data: Partial<{ title: string; background: string; is_starred: number }>): Promise<Board> {
    const res = await fetch(`${API_BASE}/boards/${boardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteBoard(boardId: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/boards/${boardId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async createList(boardId: string, title: string): Promise<List> {
    const res = await fetch(`${API_BASE}/boards/${boardId}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, user_name: 'کاربر' }),
    });
    return handleResponse(res);
  },

  async updateList(listId: string, data: { title?: string; position?: number }): Promise<List> {
    const res = await fetch(`${API_BASE}/lists/${listId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteList(listId: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/lists/${listId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async createCard(
    listId: string,
    data: { title: string; description?: string; due_date?: string | null; cover_color?: string | null; members?: any[] }
  ): Promise<Card> {
    const res = await fetch(`${API_BASE}/lists/${listId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, user_name: 'کاربر' }),
    });
    return handleResponse(res);
  },

  async getCard(cardId: string): Promise<Card> {
    const res = await fetch(`${API_BASE}/cards/${cardId}`);
    return handleResponse(res);
  },

  async updateCard(cardId: string, data: Partial<Card> & { due_date_jalali?: string | null }): Promise<Card> {
    const res = await fetch(`${API_BASE}/cards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Jalali (Shamsi) calendar metadata for the due-date picker: today in
  // Shamsi + leap years, so the UI never duplicates the conversion math.
  async getJalaliMeta(): Promise<JalaliMeta> {
    const res = await fetch(`${API_BASE}/utils/jalali-meta?from_year=1390&to_year=1430`);
    return handleResponse(res);
  },

  async deleteCard(cardId: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/cards/${cardId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async moveCard(cardId: string, targetListId: string, newPosition: number): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/cards/${cardId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_list_id: targetListId, new_position: newPosition, user_name: 'کاربر' }),
    });
    return handleResponse(res);
  },

  async toggleCardLabel(cardId: string, labelId: string): Promise<{ action: string; card_id: string; label_id: string }> {
    const res = await fetch(`${API_BASE}/cards/${cardId}/labels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label_id: labelId }),
    });
    return handleResponse(res);
  },

  async createBoardLabel(boardId: string, name: string, color: string): Promise<Label> {
    const res = await fetch(`${API_BASE}/boards/${boardId}/labels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    return handleResponse(res);
  },

  async createChecklist(cardId: string, title: string): Promise<Checklist> {
    const res = await fetch(`${API_BASE}/cards/${cardId}/checklists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    return handleResponse(res);
  },

  async updateChecklist(checklistId: string, title: string): Promise<{ id: string; title: string }> {
    const res = await fetch(`${API_BASE}/checklists/${checklistId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    return handleResponse(res);
  },

  async deleteChecklist(checklistId: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/checklists/${checklistId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async createChecklistItem(checklistId: string, text: string): Promise<ChecklistItem> {
    const res = await fetch(`${API_BASE}/checklists/${checklistId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return handleResponse(res);
  },

  async updateChecklistItem(itemId: string, data: { text?: string; is_completed?: number }): Promise<ChecklistItem> {
    const res = await fetch(`${API_BASE}/checklist_items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteChecklistItem(itemId: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/checklist_items/${itemId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async createComment(cardId: string, text: string, authorName: string = 'کاربر', authorAvatar: string = 'AR'): Promise<Comment> {
    const res = await fetch(`${API_BASE}/cards/${cardId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, author_name: authorName, author_avatar: authorAvatar }),
    });
    return handleResponse(res);
  },

  async deleteComment(commentId: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async getActivities(boardId: string): Promise<Activity[]> {
    const res = await fetch(`${API_BASE}/boards/${boardId}/activities`);
    return handleResponse(res);
  },

  async resetData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/reset-data`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async exportData(): Promise<any> {
    const res = await fetch(`${API_BASE}/export`);
    return handleResponse(res);
  },

  async importData(data: any): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};
