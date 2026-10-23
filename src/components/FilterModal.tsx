import React from 'react';
import { X, Filter, Check } from 'lucide-react';
import type { FilterState, Label } from '../types';
import { translations, type Language } from '../translations';

interface FilterModalProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  labels: Label[];
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  filter,
  setFilter,
  labels,
  isOpen,
  onClose,
  lang,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  const toggleLabel = (labelId: string) => {
    setFilter((prev) => {
      const exists = prev.labelIds.includes(labelId);
      return {
        ...prev,
        labelIds: exists
          ? prev.labelIds.filter((id) => id !== labelId)
          : [...prev.labelIds, labelId],
      };
    });
  };

  const handleClear = () => {
    setFilter({
      search: '',
      labelIds: [],
      dueStatus: 'all',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-5 space-y-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {t.filter}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter by Due Date */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
            {t.filterByDueDate}
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'all', label: t.allCards },
              { id: 'overdue', label: t.overdue },
              { id: 'today', label: t.dueSoon },
              { id: 'completed', label: t.completed },
              { id: 'nodate', label: t.noDueDate },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() =>
                  setFilter((prev) => ({
                    ...prev,
                    dueStatus: st.id as FilterState['dueStatus'],
                  }))
                }
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-right transition border ${
                  filter.dueStatus === st.id
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 border-sky-400'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter by Labels */}
        {labels.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {t.filterByLabel}
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {labels.map((lbl) => {
                const isSelected = filter.labelIds.includes(lbl.id);
                return (
                  <button
                    key={lbl.id}
                    type="button"
                    onClick={() => toggleLabel(lbl.id)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition shadow-xs"
                    style={{ backgroundColor: lbl.color }}
                  >
                    <span>{lbl.name}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
          >
            {t.clearFilter}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
