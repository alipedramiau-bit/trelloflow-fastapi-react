import React, { useState, useEffect, useCallback } from 'react';
import type { Board, Card, FilterState, ThemeBackground, User } from './types';
import { api } from './api';
import { Header } from './components/Header';
import { BoardView } from './components/BoardView';
import { CardDetailModal } from './components/CardDetailModal';
import { NewBoardModal } from './components/NewBoardModal';
import { ActivityDrawer } from './components/ActivityDrawer';
import { FilterModal } from './components/FilterModal';
import { ExportImportModal } from './components/ExportImportModal';
import { LoginScreen } from './components/LoginScreen';
import { translations, type Language, getTheme } from './translations';
import { Loader2, Plus, AlertCircle, Database } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('fa');
  const t = translations[lang];

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('trelloflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Data states
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingBoardDetails, setLoadingBoardDetails] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(true);

  // Modals & Drawers
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [newBoardModalOpen, setNewBoardModalOpen] = useState(false);
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);

  // Filters
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    labelIds: [],
    dueStatus: 'all',
  });

  // Sync HTML direction attribute
  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Check health and load boards
  const loadBoards = useCallback(async (selectBoardId?: string) => {
    try {
      setLoadingBoards(true);
      const health = await api.getHealth().catch(() => null);
      setBackendHealthy(!!health);

      const boardList = await api.getBoards();
      setBoards(boardList);

      if (boardList.length > 0) {
        const targetId =
          selectBoardId && boardList.some((b) => b.id === selectBoardId)
            ? selectBoardId
            : boardList[0].id;
        loadBoardDetails(targetId);
      } else {
        setCurrentBoard(null);
      }
    } catch (err) {
      console.error('Failed to load boards:', err);
    } finally {
      setLoadingBoards(false);
    }
  }, []);

  const loadBoardDetails = async (boardId: string) => {
    try {
      setLoadingBoardDetails(true);
      const fullBoard = await api.getBoard(boardId);
      setCurrentBoard(fullBoard);
    } catch (err) {
      console.error('Failed to load board details:', err);
    } finally {
      setLoadingBoardDetails(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  // Handlers
  const handleSelectBoard = (boardId: string) => {
    if (currentBoard?.id === boardId) return;
    loadBoardDetails(boardId);
  };

  const handleCreateBoard = async (title: string, background: ThemeBackground) => {
    try {
      const newBoard = await api.createBoard(title, background);
      await loadBoards(newBoard.id);
    } catch (err) {
      console.error('Failed to create board:', err);
    }
  };

  const handleUpdateBoard = async (data: Partial<Board>) => {
    if (!currentBoard) return;
    try {
      // Optimistic update
      setCurrentBoard((prev) => (prev ? { ...prev, ...data } : null));
      setBoards((prev) =>
        prev.map((b) => (b.id === currentBoard.id ? { ...b, ...data } : b))
      );
      await api.updateBoard(currentBoard.id, data);
    } catch (err) {
      console.error('Failed to update board:', err);
      loadBoardDetails(currentBoard.id);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm(t.deleteBoardConfirm)) return;
    try {
      await api.deleteBoard(boardId);
      loadBoards();
    } catch (err) {
      console.error('Failed to delete board:', err);
    }
  };

  const handleAddList = async (title: string) => {
    if (!currentBoard) return;
    try {
      const newList = await api.createList(currentBoard.id, title);
      setCurrentBoard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          lists: [...(prev.lists || []), newList],
        };
      });
    } catch (err) {
      console.error('Failed to add list:', err);
    }
  };

  const handleUpdateListTitle = async (listId: string, newTitle: string) => {
    if (!currentBoard) return;
    try {
      // Optimistic update
      setCurrentBoard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          lists: prev.lists?.map((l) =>
            l.id === listId ? { ...l, title: newTitle } : l
          ),
        };
      });
      await api.updateList(listId, { title: newTitle });
    } catch (err) {
      console.error('Failed to update list title:', err);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!currentBoard) return;
    try {
      // Optimistic update
      setCurrentBoard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          lists: prev.lists?.filter((l) => l.id !== listId),
        };
      });
      await api.deleteList(listId);
    } catch (err) {
      console.error('Failed to delete list:', err);
      loadBoardDetails(currentBoard.id);
    }
  };

  const handleAddCard = async (listId: string, title: string) => {
    if (!currentBoard) return;
    try {
      const newCard = await api.createCard(listId, { title });
      setCurrentBoard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          lists: prev.lists?.map((l) =>
            l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l
          ),
        };
      });
    } catch (err) {
      console.error('Failed to create card:', err);
    }
  };

  const handleMoveCard = async (
    cardId: string,
    targetListId: string,
    newPosition: number
  ) => {
    if (!currentBoard) return;

    // Optimistic re-render
    let movedCard: Card | null = null;
    const oldLists = currentBoard.lists || [];

    const newLists = oldLists.map((list) => {
      const card = list.cards.find((c) => c.id === cardId);
      if (card) {
        movedCard = { ...card, list_id: targetListId, position: newPosition };
        return {
          ...list,
          cards: list.cards.filter((c) => c.id !== cardId),
        };
      }
      return list;
    });

    if (movedCard) {
      const finalLists = newLists.map((list) => {
        if (list.id === targetListId) {
          const updatedCards = [...list.cards, movedCard!].sort(
            (a, b) => a.position - b.position
          );
          return { ...list, cards: updatedCards };
        }
        return list;
      });

      setCurrentBoard({ ...currentBoard, lists: finalLists });
    }

    try {
      await api.moveCard(cardId, targetListId, newPosition);
    } catch (err) {
      console.error('Failed to move card:', err);
      loadBoardDetails(currentBoard.id);
    }
  };

  const handleUpdateCardInBoard = (updatedCard: Card) => {
    if (!currentBoard) return;
    setCurrentBoard((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        lists: prev.lists?.map((l) => ({
          ...l,
          cards: l.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
        })),
      };
    });
    if (selectedCard?.id === updatedCard.id) {
      setSelectedCard(updatedCard);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!currentBoard) return;
    try {
      // Optimistic remove
      setCurrentBoard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          lists: prev.lists?.map((l) => ({
            ...l,
            cards: l.cards.filter((c) => c.id !== cardId),
          })),
        };
      });
      await api.deleteCard(cardId);
      if (selectedCard?.id === cardId) {
        setSelectedCard(null);
      }
    } catch (err) {
      console.error('Failed to delete card:', err);
      loadBoardDetails(currentBoard.id);
    }
  };

  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('trelloflow_user', JSON.stringify(user));
      localStorage.setItem('trelloflow_token', token);
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('trelloflow_user');
      localStorage.removeItem('trelloflow_token');
    } catch {
      // ignore
    }
  };

  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
        setLang={setLang}
        backendHealthy={backendHealthy}
      />
    );
  }

  const currentTheme = getTheme(currentBoard?.background || 'ocean');

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 overflow-hidden ${
        currentTheme.gradientClass
      }`}
      style={{ backgroundColor: (currentTheme as any).solidBg || '#0f172a' }}
    >
      {/* Top Application Header */}
      <Header
        boards={boards}
        currentBoard={currentBoard}
        onSelectBoard={handleSelectBoard}
        onUpdateBoard={handleUpdateBoard}
        onOpenNewBoardModal={() => setNewBoardModalOpen(true)}
        onOpenActivityDrawer={() => setActivityDrawerOpen(true)}
        onOpenFilterModal={() => setFilterModalOpen(true)}
        onOpenBackupModal={() => setBackupModalOpen(true)}
        filter={filter}
        setFilter={setFilter}
        lang={lang}
        setLang={setLang}
        backendHealthy={backendHealthy}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Kanban Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {loadingBoards ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/80 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <p className="text-sm font-medium">در حال اتصال به بک‌اند پایتون و بارگذاری تخته‌ها...</p>
          </div>
        ) : currentBoard ? (
          <BoardView
            board={currentBoard}
            filter={filter}
            lang={lang}
            onCardClick={(card) => setSelectedCard(card)}
            onAddCard={handleAddCard}
            onAddList={handleAddList}
            onUpdateListTitle={handleUpdateListTitle}
            onDeleteList={handleDeleteList}
            onMoveCard={handleMoveCard}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur shadow-inner">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t.emptyBoardHint}</h2>
            <p className="text-sm text-white/70 max-w-sm mb-6">
              اولین تخته مدیریت پروژه خود را ایجاد کنید تا کارهایتان را سازماندهی نمایید.
            </p>
            <button
              onClick={() => setNewBoardModalOpen(true)}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-sm rounded-xl shadow-lg transition"
            >
              {t.createNewBoard}
            </button>
          </div>
        )}
      </main>

      {/* Card Detail Modal */}
      {selectedCard && currentBoard && (
        <CardDetailModal
          card={selectedCard}
          board={currentBoard}
          lang={lang}
          onClose={() => setSelectedCard(null)}
          onUpdateCard={handleUpdateCardInBoard}
          onDeleteCard={handleDeleteCard}
          onMoveCard={handleMoveCard}
        />
      )}

      {/* New Board Modal */}
      {newBoardModalOpen && (
        <NewBoardModal
          lang={lang}
          onClose={() => setNewBoardModalOpen(false)}
          onCreate={handleCreateBoard}
        />
      )}

      {/* Activity Log Drawer */}
      <ActivityDrawer
        activities={currentBoard?.activities || []}
        isOpen={activityDrawerOpen}
        onClose={() => setActivityDrawerOpen(false)}
        onRefresh={() => currentBoard && loadBoardDetails(currentBoard.id)}
        lang={lang}
      />

      {/* Filter Modal */}
      <FilterModal
        filter={filter}
        setFilter={setFilter}
        labels={currentBoard?.labels || []}
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        lang={lang}
      />

      {/* Backup, Import, and Reset Modal */}
      <ExportImportModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
        lang={lang}
        onDataChanged={() => currentBoard && loadBoards(currentBoard.id)}
      />
    </div>
  );
}
