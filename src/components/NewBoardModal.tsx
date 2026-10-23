import React, { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { translations, type Language, THEMES } from '../translations';
import type { ThemeBackground } from '../types';

interface NewBoardModalProps {
  lang: Language;
  onClose: () => void;
  onCreate: (title: string, background: ThemeBackground) => void;
}

export const NewBoardModal: React.FC<NewBoardModalProps> = ({
  lang,
  onClose,
  onCreate,
}) => {
  const t = translations[lang];
  const [title, setTitle] = useState('');
  const [selectedBg, setSelectedBg] = useState<ThemeBackground>('ocean');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim(), selectedBg);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {t.createNewBoard}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.boardTitlePlaceholder}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: پروژه ریدیزاین وب‌سایت"
              autoFocus
              className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100 transition shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              {t.selectBackground}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedBg(theme.id as ThemeBackground)}
                  className={`h-16 rounded-xl flex flex-col justify-end p-2 text-right relative overflow-hidden transition transform hover:scale-[1.02] shadow-sm ${
                    theme.gradientClass
                  } ${
                    selectedBg === theme.id
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-sky-600'
                      : ''
                  }`}
                >
                  <span className="text-[11px] font-bold text-white drop-shadow truncate">
                    {lang === 'fa' ? theme.nameFa : theme.nameEn}
                  </span>
                  {selectedBg === theme.id && (
                    <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-white text-slate-900 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition"
            >
              {t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
