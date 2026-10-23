import React from 'react';
import {
  AlignLeft,
  CheckSquare,
  MessageSquare,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import type { Card } from '../types';
import type { Language } from '../translations';

interface CardItemProps {
  card: Card;
  onClick: () => void;
  lang: Language;
  onDragStart: (e: React.DragEvent, cardId: string, listId: string) => void;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  onClick,
  lang,
  onDragStart,
}) => {
  // Format due date & calculate status
  let dueDateText = '';
  let dueDateStatus: 'overdue' | 'due-soon' | 'completed' | 'normal' = 'normal';

  if (card.due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(card.due_date);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (card.is_completed) {
      dueDateStatus = 'completed';
    } else if (diffDays < 0) {
      dueDateStatus = 'overdue';
    } else if (diffDays <= 2) {
      dueDateStatus = 'due-soon';
    }

    dueDateText = card.due_date;
  }

  const hasChecklists = card.checklist_stats && card.checklist_stats.total > 0;
  const checklistComplete =
    hasChecklists &&
    card.checklist_stats.completed === card.checklist_stats.total;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id, card.list_id)}
      onClick={onClick}
      className="group relative rounded-lg shadow-sm border hover:shadow-md transition duration-150 cursor-pointer overflow-hidden flex flex-col active:scale-[0.99]"
      style={{
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        color: '#0f172a',
      }}
    >
      {/* Cover Color Bar */}
      {card.cover_color && (
        <div
          className="h-7 w-full transition"
          style={{ backgroundColor: card.cover_color }}
        />
      )}

      <div className="p-3 flex flex-col gap-2">
        {/* Labels Row */}
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            {card.labels.map((lbl, idx) => (
              <span
                key={lbl.id || (lbl as any).label_id || `${card.id}-lbl-${idx}`}
                className="px-2 py-0.5 rounded text-[11px] font-semibold text-white tracking-wide shadow-xs"
                style={{ backgroundColor: lbl.color, color: '#ffffff' }}
              >
                {lbl.name}
              </span>
            ))}
          </div>
        )}

        {/* Card Title */}
        <h4
          className="text-sm font-semibold leading-snug line-clamp-3 select-none"
          style={{ color: '#0f172a' }}
        >
          {card.title}
        </h4>

        {/* Card Badges Row */}
        <div
          className="flex items-center justify-between text-xs pt-1 border-t mt-1"
          style={{ borderColor: '#f1f5f9', color: '#64748b' }}
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Due Date Indicator */}
            {card.due_date && (
              <div
                className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                  dueDateStatus === 'completed'
                    ? 'text-emerald-700 bg-emerald-50'
                    : dueDateStatus === 'overdue'
                    ? 'text-rose-700 bg-rose-50'
                    : dueDateStatus === 'due-soon'
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-slate-600 bg-slate-100'
                }`}
                title={dueDateText}
              >
                {dueDateStatus === 'completed' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                <span>{dueDateText}</span>
              </div>
            )}

            {/* Description icon */}
            {card.description && card.description.trim().length > 0 && (
              <span title="دارای توضیحات" className="text-slate-400">
                <AlignLeft className="w-3.5 h-3.5" />
              </span>
            )}

            {/* Checklist progress */}
            {hasChecklists && (
              <div
                className={`flex items-center gap-1 text-[11px] ${
                  checklistComplete
                    ? 'text-emerald-600 font-semibold'
                    : 'text-slate-500'
                }`}
                title="وضعیت چک‌لیست"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>
                  {card.checklist_stats.completed}/{card.checklist_stats.total}
                </span>
              </div>
            )}

            {/* Comments count */}
            {card.comment_count > 0 && (
              <div
                className="flex items-center gap-1 text-[11px] text-slate-500"
                title={`${card.comment_count} نظر`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{card.comment_count}</span>
              </div>
            )}
          </div>

          {/* Members Avatars */}
          {card.members && card.members.length > 0 && (
            <div className="flex -space-x-1.5 rtl:space-x-reverse overflow-hidden">
              {card.members.map((m, idx) => (
                <div
                  key={`${card.id}-member-${m.name || idx}`}
                  title={m.name}
                  className={`w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white shadow-xs ${
                    m.color || 'bg-indigo-600'
                  }`}
                >
                  {m.avatar || m.name.slice(0, 2)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
