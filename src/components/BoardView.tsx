import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Board, Card, FilterState } from '../types';
import { ListColumn } from './ListColumn';
import { translations, type Language } from '../translations';

interface BoardViewProps {
  board: Board;
  filter: FilterState;
  lang: Language;
  onCardClick: (card: Card) => void;
  onAddCard: (listId: string, title: string) => void;
  onAddList: (title: string) => void;
  onUpdateListTitle: (listId: string, newTitle: string) => void;
  onDeleteList: (listId: string) => void;
  onMoveCard: (cardId: string, targetListId: string, newPosition: number) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  board,
  filter,
  lang,
  onCardClick,
  onAddCard,
  onAddList,
  onUpdateListTitle,
  onDeleteList,
  onMoveCard,
}) => {
  const t = translations[lang];
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListTitle.trim()) {
      onAddList(newListTitle.trim());
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  const handleDragStartCard = (
    e: React.DragEvent,
    cardId: string,
    listId: string
  ) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ cardId, sourceListId: listId })
    );
  };

  const handleDropCard = (e: React.DragEvent, targetListId: string) => {
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const { cardId, sourceListId } = JSON.parse(dataStr);

      const targetList = board.lists?.find((l) => l.id === targetListId);
      if (!targetList) return;

      // Position card at bottom of list
      const maxPos = targetList.cards.reduce(
        (max, c) => Math.max(max, c.position),
        0
      );
      const newPos = maxPos + 1000;

      onMoveCard(cardId, targetListId, newPos);
    } catch (err) {
      console.error('Error dropping card:', err);
    }
  };

  // Filter cards logic
  const filterCard = (card: Card) => {
    // 1. Search text
    if (filter.search.trim()) {
      const term = filter.search.toLowerCase();
      const matchTitle = card.title.toLowerCase().includes(term);
      const matchDesc = card.description?.toLowerCase().includes(term);
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. Labels filter
    if (filter.labelIds.length > 0) {
      const cardLabelIds = card.labels.map((l) => l.id);
      const matchesAnyLabel = filter.labelIds.some((id) =>
        cardLabelIds.includes(id)
      );
      if (!matchesAnyLabel) return false;
    }

    // 3. Due status filter
    if (filter.dueStatus !== 'all') {
      if (filter.dueStatus === 'nodate') {
        if (card.due_date) return false;
      } else if (filter.dueStatus === 'completed') {
        if (!card.is_completed) return false;
      } else if (filter.dueStatus === 'overdue') {
        if (!card.due_date || card.is_completed) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(card.due_date);
        due.setHours(0, 0, 0, 0);
        if (due.getTime() >= today.getTime()) return false;
      } else if (filter.dueStatus === 'today') {
        if (!card.due_date || card.is_completed) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(card.due_date);
        due.setHours(0, 0, 0, 0);
        const diff = Math.ceil(
          (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diff < 0 || diff > 2) return false;
      }
    }

    return true;
  };

  const lists = board.lists || [];

  return (
    <div className="flex-1 overflow-x-auto p-4 md:p-6 kanban-board-scroll">
      <div className="flex items-start gap-4 h-full pb-4 min-w-max">
        {lists.map((list) => {
          const filteredCards = list.cards.filter(filterCard);
          return (
            <ListColumn
              key={list.id}
              list={list}
              cards={filteredCards}
              lang={lang}
              onCardClick={onCardClick}
              onAddCard={onAddCard}
              onUpdateListTitle={onUpdateListTitle}
              onDeleteList={onDeleteList}
              onDragStartCard={handleDragStartCard}
              onDropCard={handleDropCard}
            />
          );
        })}

        {/* Add Another List Column */}
        <div className="w-72 sm:w-80 shrink-0">
          {isAddingList ? (
            <form
              onSubmit={handleCreateList}
              className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 shadow-xl flex flex-col gap-2.5"
            >
              <input
                type="text"
                placeholder={t.addListPlaceholder}
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                autoFocus
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-sky-400 rounded-lg outline-none text-slate-800 dark:text-slate-100 shadow-sm"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-semibold shadow transition"
                >
                  {t.addList}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingList(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingList(true)}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-sm font-semibold transition border border-white/15 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addList}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
