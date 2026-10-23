import React from 'react';
import { X, History, RefreshCw } from 'lucide-react';
import type { Activity } from '../types';
import { translations, type Language } from '../translations';

interface ActivityDrawerProps {
  activities: Activity[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  lang: Language;
}

export const ActivityDrawer: React.FC<ActivityDrawerProps> = ({
  activities,
  isOpen,
  onClose,
  onRefresh,
  lang,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col p-6 space-y-4 animate-slide-in select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-sky-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {t.activity}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onRefresh}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="بروزرسانی لاگ"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Activities List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              {t.noActivity}
            </div>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {act.user_name}
                  </span>
                  <span className="text-[10px]">
                    {act.created_at.slice(0, 16).replace('T', ' ')}
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-300 leading-relaxed">
                  {act.action_text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
