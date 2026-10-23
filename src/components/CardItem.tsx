import React from 'react';
import {
  Clock,
  CheckSquare2,
  MessageSquare,
  AlignLeft,
  CheckCircle2,
} from 'lucide-react';
import type { Card } from '../types';
import { translations, type Language, formatDate } from '../translations';

interface CardItemProps {
  card: Card;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, cardId: string, listId: string) => void;
  lang: Language;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  onClick,
  onDragStart,
  lang,
}) => {
  const t = translations[lang];

  // Calculate Due Date Status
  const getDueDateStatus = () => {
    if (!card.due_date) return null;
    if (card.is_completed) return 'completed';

    const due = new Date(card.due_date);
    const now = new Date();
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0) return 'overdue';
    if (diffHours <= 24) return 'due-soon';
    return 'normal';
  };

  const dueDateStatus = getDueDateStatus();
  const dueDateText =
    dueDateStatus === 'completed'
      ? t.completed
      : dueDateStatus === 'overdue'
      ? t.overdue
      : dueDateStatus === 'due-soon'
      ? t.dueSoon
      : undefined;

  const hasChecklists =
    card.checklist_stats && card.checklist_stats.total > 0;
  const hasComments =
    typeof card.comment_count === 'number' && card.comment_count > 0;
  const isAllChecklistDone =
    hasChecklists &&
    card.checklist_stats.completed === card.checklist_stats.total;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id, card.list_id)}
      onClick={onClick}
      className="group relative rounded-xl shadow-md border hover:border-sky-400 transition-all duration-150 cursor-pointer overflow-hidden flex flex-col active:scale-[0.99]"
      style={{
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        color: '#ffffff',
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
        {/* Card Title (kept above the label chips) */}
        <h4
          className="text-sm font-semibold leading-snug line-clamp-3 select-none"
          style={{
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
          }}
        >
          {card.title}
        </h4>

        {/* Labels Row */}
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            {card.labels.map((lbl, idx) => (
              <span
                key={lbl.id || (lbl as any).label_id || `${card.id}-lbl-${idx}`}
                className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wide shadow-xs"
                style={{ backgroundColor: lbl.color, color: '#ffffff' }}
              >
                {lbl.name}
              </span>
            ))}
          </div>
        )}

        {/* Card Badges Row */}
        <div
          className="flex items-center justify-between text-xs pt-1.5 border-t mt-1"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Due Date Indicator */}
            {card.due_date && (
              <div
                className="flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border"
                style={{
                  backgroundColor:
                    dueDateStatus === 'completed'
                      ? 'rgba(6, 78, 59, 0.7)'
                      : dueDateStatus === 'overdue'
                      ? 'rgba(136, 19, 55, 0.7)'
                      : dueDateStatus === 'due-soon'
                      ? 'rgba(120, 53, 15, 0.7)'
                      : 'rgba(51, 65, 85, 0.7)',
                  color:
                    dueDateStatus === 'completed'
                      ? '#6ee7b7'
                      : dueDateStatus === 'overdue'
                      ? '#fda4af'
                      : dueDateStatus === 'due-soon'
                      ? '#fcd34d'
                      : '#cbd5e1',
                  borderColor:
                    dueDateStatus === 'completed'
                      ? 'rgba(16, 185, 129, 0.4)'
                      : dueDateStatus === 'overdue'
                      ? 'rgba(244, 63, 94, 0.4)'
                      : dueDateStatus === 'due-soon'
                      ? 'rgba(245, 158, 11, 0.4)'
                      : 'rgba(100, 116, 139, 0.4)',
                }}
                title={dueDateText}
              >
                {dueDateStatus === 'completed' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                <span>{formatDate(card.due_date)}</span>
              </div>
            )}

            {/* Description Icon */}
            {card.description && (
              <span title="دارای توضیحات" className="flex items-center">
                <AlignLeft
                  className="w-3.5 h-3.5"
                  style={{ color: '#94a3b8' }}
                />
              </span>
            )}

            {/* Checklist Progress Badge */}
            {hasChecklists && (
              <div
                className="flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border"
                style={{
                  backgroundColor: isAllChecklistDone
                    ? 'rgba(6, 78, 59, 0.7)'
                    : 'rgba(51, 65, 85, 0.7)',
                  color: isAllChecklistDone ? '#6ee7b7' : '#cbd5e1',
                  borderColor: isAllChecklistDone
                    ? 'rgba(16, 185, 129, 0.4)'
                    : 'rgba(100, 116, 139, 0.4)',
                }}
                title={`${card.checklist_stats.completed} از ${card.checklist_stats.total} چک‌لیست تکمیل شده`}
              >
                <CheckSquare2 className="w-3 h-3" />
                <span>
                  {card.checklist_stats.completed}/{card.checklist_stats.total}
                </span>
              </div>
            )}

            {/* Comments Count */}
            {hasComments && (
              <div
                className="flex items-center gap-1 text-[11px]"
                style={{ color: '#94a3b8' }}
                title={`${card.comment_count} نظر`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>{card.comment_count}</span>
              </div>
            )}
          </div>

          {/* Assigned Members */}
          {card.members && card.members.length > 0 && (
            <div className="flex items-center -space-x-1.5 rtl:space-x-reverse">
              {card.members.map((member, idx) => (
                <div
                  key={idx}
                  className={`w-5 h-5 rounded-full ${member.color} text-[10px] font-bold text-white flex items-center justify-center ring-1 ring-slate-800 shadow-xs`}
                  title={member.name}
                >
                  {member.avatar}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
