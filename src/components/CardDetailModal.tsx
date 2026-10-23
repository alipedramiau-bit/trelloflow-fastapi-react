import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  AlignLeft,
  CheckSquare,
  MessageSquare,
  Clock,
  Tag,
  UserPlus,
  Palette,
  Trash2,
  ArrowRight,
  Plus,
  Check,
  CheckCircle2,
  Calendar,
  Send,
} from 'lucide-react';
import type { Card, Board, Label, Checklist, ChecklistItem } from '../types';
import { translations, type Language } from '../translations';
import { api } from '../api';

interface CardDetailModalProps {
  card: Card;
  board: Board;
  lang: Language;
  onClose: () => void;
  onUpdateCard: (updatedCard: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onMoveCard: (cardId: string, targetListId: string, newPosition: number) => void;
}

const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
];

const AVAILABLE_MEMBERS = [
  { name: 'علی رضایی', avatar: 'AR', color: 'bg-indigo-600' },
  { name: 'سارا کاظمی', avatar: 'SK', color: 'bg-amber-600' },
  { name: 'محمد احمدی', avatar: 'MA', color: 'bg-emerald-600' },
  { name: 'نیلوفر مهرابی', avatar: 'NM', color: 'bg-rose-600' },
];

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card: initialCard,
  board,
  lang,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onMoveCard,
}) => {
  const t = translations[lang];
  const [card, setCard] = useState<Card>(initialCard);
  const [loading, setLoading] = useState(false);

  // Editable fields
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(card.title);

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState(card.description || '');

  // Popover menus
  const [labelMenuOpen, setLabelMenuOpen] = useState(false);
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const [coverMenuOpen, setCoverMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [newChecklistOpen, setNewChecklistOpen] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');

  // Comment input
  const [commentText, setCommentText] = useState('');

  // New item inputs by checklist ID
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});
  const [activeNewItem, setActiveNewItem] = useState<string | null>(null);

  // New label form
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0]);

  // Load detailed card with checklists and comments
  const fetchCardDetails = async () => {
    try {
      const detailed = await api.getCard(card.id);
      setCard(detailed);
      setTitleInput(detailed.title);
      setDescInput(detailed.description || '');
      onUpdateCard(detailed);
    } catch (err) {
      console.error('Failed to fetch card details:', err);
    }
  };

  useEffect(() => {
    fetchCardDetails();
  }, [card.id]);

  const currentList = board.lists?.find((l) => l.id === card.list_id);

  // Save Title
  const handleSaveTitle = async () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== card.title) {
      try {
        const updated = await api.updateCard(card.id, { title: titleInput.trim() });
        setCard((prev) => ({ ...prev, title: updated.title }));
        onUpdateCard({ ...card, title: updated.title });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Save Description
  const handleSaveDesc = async () => {
    setIsEditingDesc(false);
    try {
      const updated = await api.updateCard(card.id, { description: descInput });
      setCard((prev) => ({ ...prev, description: updated.description }));
      onUpdateCard({ ...card, description: updated.description });
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Card Completion
  const handleToggleCompleted = async () => {
    const nextStatus = card.is_completed ? 0 : 1;
    try {
      const updated = await api.updateCard(card.id, { is_completed: nextStatus });
      setCard((prev) => ({ ...prev, is_completed: updated.is_completed }));
      onUpdateCard({ ...card, is_completed: updated.is_completed });
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Label
  const handleToggleLabel = async (labelId: string) => {
    try {
      await api.toggleCardLabel(card.id, labelId);
      await fetchCardDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Create Label
  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    try {
      const newLabel = await api.createBoardLabel(board.id, newLabelName.trim(), newLabelColor);
      board.labels?.push(newLabel);
      await api.toggleCardLabel(card.id, newLabel.id);
      setNewLabelName('');
      await fetchCardDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Member
  const handleToggleMember = async (member: (typeof AVAILABLE_MEMBERS)[0]) => {
    const currentMembers = card.members || [];
    const exists = currentMembers.some((m) => m.name === member.name);
    const newMembers = exists
      ? currentMembers.filter((m) => m.name !== member.name)
      : [...currentMembers, member];

    try {
      const updated = await api.updateCard(card.id, { members: newMembers });
      setCard((prev) => ({ ...prev, members: updated.members }));
      onUpdateCard({ ...card, members: updated.members });
    } catch (err) {
      console.error(err);
    }
  };

  // Set Due Date
  const handleSetDueDate = async (dateStr: string | null) => {
    try {
      const updated = await api.updateCard(card.id, { due_date: dateStr });
      setCard((prev) => ({ ...prev, due_date: updated.due_date }));
      onUpdateCard({ ...card, due_date: updated.due_date });
      setDateMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Set Cover Color
  const handleSetCoverColor = async (color: string | null) => {
    try {
      const updated = await api.updateCard(card.id, { cover_color: color });
      setCard((prev) => ({ ...prev, cover_color: updated.cover_color }));
      onUpdateCard({ ...card, cover_color: updated.cover_color });
      setCoverMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Add Checklist
  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    try {
      await api.createChecklist(card.id, newChecklistTitle.trim());
      setNewChecklistTitle('');
      setNewChecklistOpen(false);
      await fetchCardDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Checklist
  const handleDeleteChecklist = async (checklistId: string) => {
    try {
      await api.deleteChecklist(checklistId);
      await fetchCardDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Checklist Item
  const handleAddChecklistItem = async (checklistId: string) => {
    const text = newItemInputs[checklistId]?.trim();
    if (!text) return;
    try {
      await api.createChecklistItem(checklistId, text);
      setNewItemInputs((prev) => ({ ...prev, [checklistId]: '' }));
      await fetchCardDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Checklist Item
  const handleToggleChecklistItem = async (item: ChecklistItem) => {
    try {
      await api.updateChecklistItem(item.id, {
        is_completed: item.is_completed ? 0 : 1,
      });
      await fetchCardDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Checklist Item
  const handleDeleteChecklistItem = async (itemId: string) => {
    try {
      await api.deleteChecklistItem(itemId);
      await fetchCardDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api.createComment(card.id, commentText.trim(), 'کاربر فعال', 'KU');
      setCommentText('');
      await fetchCardDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Move Card to another List
  const handleMoveList = (targetListId: string) => {
    if (targetListId === card.list_id) return;
    const targetList = board.lists?.find((l) => l.id === targetListId);
    const maxPos =
      targetList?.cards.reduce((max, c) => Math.max(max, c.position), 0) || 0;
    onMoveCard(card.id, targetListId, maxPos + 1000);
    onClose();
  };

  const cardLabelIds = card.labels?.map((l) => l.id) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Banner */}
        {card.cover_color && (
          <div
            className="h-14 sm:h-20 w-full transition"
            style={{ backgroundColor: card.cover_color }}
          />
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <CreditCard className="w-5 h-5 text-slate-500 mt-1 shrink-0" />
            <div className="flex-1">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  autoFocus
                  className="w-full text-lg sm:text-xl font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-sky-500 outline-none text-slate-800 dark:text-slate-100"
                />
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 px-1 py-0.5 rounded transition"
                >
                  {card.title}
                </h2>
              )}
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>{t.inList}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {currentList?.title || 'لیست'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Content + Right Actions */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Column (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            {/* Metadata Tags Row (Labels & Due Date & Members) */}
            <div className="flex flex-wrap gap-4 items-start">
              {/* Labels */}
              {card.labels && card.labels.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {t.labels}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {card.labels.map((lbl, idx) => (
                      <span
                        key={lbl.id || (lbl as any).label_id || `modal-lbl-${idx}`}
                        className="px-2.5 py-1 rounded text-xs font-semibold text-white shadow-xs"
                        style={{ backgroundColor: lbl.color }}
                      >
                        {lbl.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Members */}
              {card.members && card.members.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {t.members}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    {card.members.map((m, idx) => (
                      <div
                        key={`modal-member-${m.name || idx}`}
                        title={m.name}
                        className={`w-7 h-7 rounded-full text-xs font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs ${
                          m.color || 'bg-indigo-600'
                        }`}
                      >
                        {m.avatar || m.name.slice(0, 2)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Due Date Indicator */}
              {card.due_date && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {t.dueDate}
                  </h4>
                  <button
                    onClick={handleToggleCompleted}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition border ${
                      card.is_completed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        card.is_completed
                          ? 'text-emerald-600 fill-emerald-600/20'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>{card.due_date}</span>
                    {card.is_completed && (
                      <span className="text-[10px] text-emerald-600 font-bold">
                        ({t.completed})
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {t.description}
                  </h3>
                </div>
                {!isEditingDesc && card.description && (
                  <button
                    onClick={() => setIsEditingDesc(true)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                  >
                    {t.edit}
                  </button>
                )}
              </div>

              {isEditingDesc ? (
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    placeholder={t.descriptionPlaceholder}
                    autoFocus
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 dark:bg-slate-800 border border-sky-400 rounded-xl outline-none text-slate-800 dark:text-slate-100 shadow-inner resize-y"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveDesc}
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-semibold shadow transition"
                    >
                      {t.save}
                    </button>
                    <button
                      onClick={() => setIsEditingDesc(false)}
                      className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-medium"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/70 transition cursor-pointer min-h-[70px] text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap"
                >
                  {card.description?.trim() ? (
                    card.description
                  ) : (
                    <span className="text-slate-400">
                      {t.descriptionPlaceholder}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Checklists Section */}
            {card.checklists && card.checklists.length > 0 && (
              <div className="space-y-6">
                {card.checklists.map((chk) => {
                  const total = chk.items?.length || 0;
                  const completed =
                    chk.items?.filter((i) => i.is_completed === 1).length || 0;
                  const percentage =
                    total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <div
                      key={chk.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-sky-600" />
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {chk.title}
                          </h4>
                        </div>
                        <button
                          onClick={() => handleDeleteChecklist(chk.id)}
                          className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                        >
                          {t.delete}
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{percentage}%</span>
                          <span>
                            {completed}/{total}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              percentage === 100
                                ? 'bg-emerald-500'
                                : 'bg-sky-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Checklist Items */}
                      <div className="space-y-1.5 pt-1">
                        {chk.items?.map((item) => (
                          <div
                            key={item.id}
                            className="group flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition"
                          >
                            <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.is_completed === 1}
                                onChange={() => handleToggleChecklistItem(item)}
                                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                              />
                              <span
                                className={`text-xs sm:text-sm text-slate-700 dark:text-slate-200 ${
                                  item.is_completed === 1
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : ''
                                }`}
                              >
                                {item.text}
                              </span>
                            </label>
                            <button
                              onClick={() => handleDeleteChecklistItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Item Form */}
                      <div className="pt-2">
                        {activeNewItem === chk.id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={newItemInputs[chk.id] || ''}
                              onChange={(e) =>
                                setNewItemInputs((prev) => ({
                                  ...prev,
                                  [chk.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddChecklistItem(chk.id);
                                }
                                if (e.key === 'Escape') setActiveNewItem(null);
                              }}
                              placeholder={t.addItemPlaceholder}
                              autoFocus
                              className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-sky-400 rounded-lg outline-none text-slate-800 dark:text-slate-100"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAddChecklistItem(chk.id)}
                                className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold shadow transition"
                              >
                                {t.addItem}
                              </button>
                              <button
                                onClick={() => setActiveNewItem(null)}
                                className="p-1 text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveNewItem(chk.id)}
                            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-sky-600 font-semibold transition py-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t.addItem}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Comments & Discussion */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t.comments}
                </h3>
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  کاربر
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t.writeComment}
                    className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100 transition resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow transition"
                  >
                    <Send className="w-3 h-3" />
                    <span>{t.postComment}</span>
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3 pt-2">
                {card.comments?.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {comment.author_avatar || 'KU'}
                    </div>
                    <div className="flex-1 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {comment.author_name}
                        </span>
                        <span className="text-[10px]">
                          {comment.created_at.slice(0, 16).replace('T', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Action Buttons */}
          <div className="space-y-4">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                افزودن به کارت
              </h4>
              <div className="space-y-2">
                {/* Labels Popover */}
                <div className="relative">
                  <button
                    onClick={() => setLabelMenuOpen(!labelMenuOpen)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                  >
                    <Tag className="w-4 h-4 text-slate-500" />
                    <span>{t.labels}</span>
                  </button>

                  {labelMenuOpen && (
                    <div className="absolute right-0 rtl:left-0 rtl:right-auto top-full mt-1.5 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-30 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 border-b pb-1.5">
                        <span>{t.labels}</span>
                        <button onClick={() => setLabelMenuOpen(false)}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Board Labels list */}
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {board.labels?.map((lbl) => {
                          const isSelected = cardLabelIds.includes(lbl.id);
                          return (
                            <button
                              key={lbl.id}
                              onClick={() => handleToggleLabel(lbl.id)}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-semibold text-white shadow-xs transition"
                              style={{ backgroundColor: lbl.color }}
                            >
                              <span>{lbl.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Create New Label */}
                      <form onSubmit={handleCreateLabel} className="space-y-2 pt-2 border-t">
                        <input
                          type="text"
                          placeholder={t.labelName}
                          value={newLabelName}
                          onChange={(e) => setNewLabelName(e.target.value)}
                          className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-800 border rounded outline-none"
                        />
                        <div className="flex gap-1.5 flex-wrap">
                          {PRESET_COLORS.map((c) => (
                            <span
                              key={c}
                              onClick={() => setNewLabelColor(c)}
                              className={`w-5 h-5 rounded-full cursor-pointer border ${
                                newLabelColor === c ? 'ring-2 ring-sky-500' : ''
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <button
                          type="submit"
                          className="w-full py-1 bg-sky-600 text-white rounded text-xs font-semibold"
                        >
                          {t.create}
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Add Checklist Modal */}
                <div className="relative">
                  <button
                    onClick={() => setNewChecklistOpen(!newChecklistOpen)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                  >
                    <CheckSquare className="w-4 h-4 text-slate-500" />
                    <span>{t.addChecklist}</span>
                  </button>

                  {newChecklistOpen && (
                    <div className="absolute right-0 rtl:left-0 rtl:right-auto top-full mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-30 space-y-2.5">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {t.addChecklist}
                      </div>
                      <input
                        type="text"
                        placeholder={t.checklistTitlePlaceholder}
                        value={newChecklistTitle}
                        onChange={(e) => setNewChecklistTitle(e.target.value)}
                        autoFocus
                        className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border rounded outline-none"
                      />
                      <button
                        onClick={handleAddChecklist}
                        className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold"
                      >
                        {t.addChecklist}
                      </button>
                    </div>
                  )}
                </div>

                {/* Due Date Picker */}
                <div className="relative">
                  <button
                    onClick={() => setDateMenuOpen(!dateMenuOpen)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                  >
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>{t.dueDate}</span>
                  </button>

                  {dateMenuOpen && (
                    <div className="absolute right-0 rtl:left-0 rtl:right-auto top-full mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-30 space-y-3">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {t.dueDate}
                      </div>
                      <input
                        type="date"
                        defaultValue={card.due_date || ''}
                        onChange={(e) => handleSetDueDate(e.target.value || null)}
                        className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border rounded outline-none"
                      />
                      {card.due_date && (
                        <button
                          onClick={() => handleSetDueDate(null)}
                          className="w-full py-1 text-rose-500 hover:bg-rose-50 text-xs rounded transition"
                        >
                          {t.noDueDate}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Assign Members */}
                <div className="relative">
                  <button
                    onClick={() => setMemberMenuOpen(!memberMenuOpen)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                  >
                    <UserPlus className="w-4 h-4 text-slate-500" />
                    <span>{t.members}</span>
                  </button>

                  {memberMenuOpen && (
                    <div className="absolute right-0 rtl:left-0 rtl:right-auto top-full mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-30 space-y-2">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                        {t.members}
                      </div>
                      {AVAILABLE_MEMBERS.map((mem) => {
                        const isAssigned = card.members?.some(
                          (m) => m.name === mem.name
                        );
                        return (
                          <button
                            key={mem.name}
                            onClick={() => handleToggleMember(mem)}
                            className="w-full flex items-center justify-between p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-6 h-6 rounded-full text-white font-bold text-[10px] flex items-center justify-center ${mem.color}`}
                              >
                                {mem.avatar}
                              </span>
                              <span>{mem.name}</span>
                            </div>
                            {isAssigned && (
                              <Check className="w-3.5 h-3.5 text-sky-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Cover Color Picker */}
                <div className="relative">
                  <button
                    onClick={() => setCoverMenuOpen(!coverMenuOpen)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                  >
                    <Palette className="w-4 h-4 text-slate-500" />
                    <span>{t.coverColor}</span>
                  </button>

                  {coverMenuOpen && (
                    <div className="absolute right-0 rtl:left-0 rtl:right-auto top-full mt-1.5 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-30 space-y-2.5">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {t.coverColor}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {PRESET_COLORS.map((col) => (
                          <div
                            key={col}
                            onClick={() => handleSetCoverColor(col)}
                            className={`h-7 rounded cursor-pointer transition transform hover:scale-105 shadow-xs ${
                              card.cover_color === col
                                ? 'ring-2 ring-sky-500'
                                : ''
                            }`}
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                      {card.cover_color && (
                        <button
                          onClick={() => handleSetCoverColor(null)}
                          className="w-full py-1 text-xs text-slate-500 hover:text-rose-600 border rounded mt-2"
                        >
                          {t.removeCover}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Move & Delete */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                عملیات کارت
              </h4>

              {/* Move to another list */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium">
                  {t.moveCard}
                </label>
                <select
                  value={card.list_id}
                  onChange={(e) => handleMoveList(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
                >
                  {board.lists?.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delete Card */}
              <button
                onClick={() => {
                  if (confirm(t.deleteCardConfirm)) {
                    onDeleteCard(card.id);
                    onClose();
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition mt-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.delete}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
