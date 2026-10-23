import React, { useState, useRef } from 'react';
import { Plus, MoreHorizontal, Trash2, X } from 'lucide-react';
import type { List, Card } from '../types';
import { CardItem } from './CardItem';
import { translations, type Language } from '../translations';

interface ListColumnProps {
  list: List;
  cards: Card[];
  lang: Language;
  onCardClick: (card: Card) => void;
  onAddCard: (listId: string, title: string) => void;
  onUpdateListTitle: (listId: string, newTitle: string) => void;
  onDeleteList: (listId: string) => void;
  onDragStartCard: (e: React.DragEvent, cardId: string, listId: string) => void;
  onDropCard: (e: React.DragEvent, targetListId: string) => void;
}

export const ListColumn: React.FC<ListColumnProps> = ({
  list,
  cards,
  lang,
  onCardClick,
  onAddCard,
  onUpdateListTitle,
  onDeleteList,
  onDragStartCard,
  onDropCard,
}) => {
  const t = translations[lang];
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitleInput, setListTitleInput] = useState(list.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCreateCard = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newCardTitle.trim()) {
      onAddCard(list.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(true); // keep open for rapid sequential additions like Trello!
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (listTitleInput.trim() && listTitleInput !== list.title) {
      onUpdateListTitle(list.id, listTitleInput.trim());
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDropCard(e, list.id);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-72 sm:w-80 shrink-0 flex flex-col max-h-[calc(100vh-140px)] rounded-xl border shadow-lg transition-all ${
        isDragOver
          ? 'border-sky-400 ring-2 ring-sky-400/40 bg-sky-950/80'
          : 'border-slate-800'
      }`}
      style={{
        backgroundColor: '#0f172a',
        borderColor: '#1e293b',
        color: '#f8fafc',
      }}
    >
      {/* List Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-200/60 dark:border-white/5 relative">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={listTitleInput}
              onChange={(e) => setListTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              autoFocus
              className="w-full text-sm font-bold bg-white px-2 py-1 border border-sky-400 rounded outline-none text-slate-800"
            />
          ) : (
            <h3
              onClick={() => setIsEditingTitle(true)}
              className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:bg-slate-200/60 dark:hover:bg-white/10 px-1.5 py-0.5 rounded transition"
              title="برای ویرایش کلیک کنید"
            >
              {list.title}
            </h3>
          )}

          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
            {cards.length}
          </span>
        </div>

        {/* List Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-white/10 transition"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute left-0 rtl:right-0 rtl:left-auto top-full mt-1 w-44 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-1 z-30">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (confirm(t.deleteListConfirm)) {
                    onDeleteList(list.id);
                  }
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.delete}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[50px]">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            lang={lang}
            onClick={() => onCardClick(card)}
            onDragStart={onDragStartCard}
          />
        ))}

        {cards.length === 0 && !isAddingCard && (
          <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            {t.dragHint}
          </div>
        )}
      </div>

      {/* List Footer: Quick Add Card Form or Add Card Button */}
      <div className="p-2 border-t border-slate-200/60 dark:border-white/5">
        {isAddingCard ? (
          <form onSubmit={handleCreateCard} className="flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              rows={2}
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCreateCard();
                }
                if (e.key === 'Escape') {
                  setIsAddingCard(false);
                }
              }}
              placeholder={t.addCardPlaceholder}
              autoFocus
              className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-sky-400 rounded-lg outline-none text-slate-800 dark:text-slate-100 shadow-sm resize-none placeholder:text-slate-400"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="submit"
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-semibold shadow transition"
              >
                {t.addCard}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCard(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-white/10 rounded-lg transition"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>{t.addCard}</span>
          </button>
        )}
      </div>
    </div>
  );
};
