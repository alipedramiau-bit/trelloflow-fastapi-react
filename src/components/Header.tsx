import React, { useState, useRef, useEffect } from 'react';
import {
  Trello,
  Star,
  ChevronDown,
  Plus,
  Search,
  Filter,
  Palette,
  History,
  Languages,
  Database,
  Download,
  Check,
  FolderKanban,
  Sparkles,
  LogOut,
} from 'lucide-react';
import type { Board, FilterState, ThemeBackground, User } from '../types';
import { translations, type Language, THEMES } from '../translations';

interface HeaderProps {
  boards: Board[];
  currentBoard: Board | null;
  onSelectBoard: (boardId: string) => void;
  onUpdateBoard: (data: Partial<Board>) => void;
  onOpenNewBoardModal: () => void;
  onOpenActivityDrawer: () => void;
  onOpenFilterModal: () => void;
  onOpenBackupModal: () => void;
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  lang: Language;
  setLang: (lang: Language) => void;
  backendHealthy: boolean;
  currentUser?: User | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  boards,
  currentBoard,
  onSelectBoard,
  onUpdateBoard,
  onOpenNewBoardModal,
  onOpenActivityDrawer,
  onOpenFilterModal,
  onOpenBackupModal,
  filter,
  setFilter,
  lang,
  setLang,
  backendHealthy,
  currentUser,
  onLogout,
}) => {
  const t = translations[lang];
  const [boardMenuOpen, setBoardMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [boardTitleInput, setBoardTitleInput] = useState('');

  const boardMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentBoard) {
      setBoardTitleInput(currentBoard.title);
    }
  }, [currentBoard]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (boardMenuRef.current && !boardMenuRef.current.contains(event.target as Node)) {
        setBoardMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (currentBoard && boardTitleInput.trim() && boardTitleInput !== currentBoard.title) {
      onUpdateBoard({ title: boardTitleInput.trim() });
    }
  };

  const handleToggleStar = () => {
    if (currentBoard) {
      onUpdateBoard({ is_starred: currentBoard.is_starred ? 0 : 1 });
    }
  };

  const handleSelectTheme = (themeId: ThemeBackground) => {
    if (currentBoard) {
      onUpdateBoard({ background: themeId });
    }
    setThemeMenuOpen(false);
  };

  const activeFilterCount =
    (filter.search ? 1 : 0) +
    filter.labelIds.length +
    (filter.dueStatus !== 'all' ? 1 : 0);

  return (
    <header className="relative z-30 flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 py-2.5 bg-black/30 backdrop-blur-md border-b border-white/10 text-white gap-3 select-none">
      {/* Left side: Brand + Board Switcher + Inline Title + Star */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* App Logo */}
        <div className="flex items-center gap-2 pr-2 border-r border-white/15">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
            <Trello className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg text-white">
            {t.appName}
          </span>
        </div>

        {/* Boards Dropdown */}
        <div className="relative" ref={boardMenuRef}>
          <button
            onClick={() => setBoardMenuOpen(!boardMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition text-sm font-medium border border-white/10 shadow-sm"
          >
            <FolderKanban className="w-4 h-4 text-white/80" />
            <span className="max-w-[130px] truncate">
              {currentBoard ? currentBoard.title : t.boards}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {boardMenuOpen && (
            <div className="absolute top-full mt-2 w-72 rounded-xl bg-slate-900/95 border border-white/15 p-2 shadow-2xl backdrop-blur-xl z-50 text-slate-100">
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/50 border-b border-white/10">
                {t.boards}
              </div>
              <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                {boards.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectBoard(b.id);
                      setBoardMenuOpen(false);
                    }}
                    className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                      currentBoard?.id === b.id
                        ? 'bg-sky-600/30 text-sky-200 border border-sky-500/30'
                        : 'hover:bg-white/10 text-white/90'
                    }`}
                  >
                    <span className="truncate">{b.title}</span>
                    {b.is_starred === 1 && (
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0 mr-1" />
                    )}
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-white/10 mt-1">
                <button
                  onClick={() => {
                    setBoardMenuOpen(false);
                    onOpenNewBoardModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  {t.createNewBoard}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Board Title (Editable inline) */}
        {currentBoard && (
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={boardTitleInput}
                onChange={(e) => setBoardTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                autoFocus
                className="px-2.5 py-1 text-base font-bold bg-white/20 border border-sky-400 rounded-md outline-none text-white shadow-inner"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-base font-bold cursor-pointer px-2.5 py-1 rounded-md hover:bg-white/15 transition border border-transparent hover:border-white/15"
                title="برای ویرایش کلیک کنید"
              >
                {currentBoard.title}
              </h1>
            )}

            <button
              onClick={handleToggleStar}
              className={`p-1.5 rounded-md transition ${
                currentBoard.is_starred
                  ? 'text-amber-400 bg-amber-400/20'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title={currentBoard.is_starred ? 'حذف از ستاره‌دارها' : 'افزودن به ستاره‌دارها'}
            >
              <Star
                className={`w-4 h-4 ${
                  currentBoard.is_starred ? 'fill-amber-400' : ''
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Right side: Search + Filter + Theme + Activity + Backend Badge + Lang */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder={t.searchCards}
            value={filter.search}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, search: e.target.value }))
            }
            className="w-32 md:w-44 pr-8 pl-3 py-1.5 text-xs rounded-md bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/15 outline-none placeholder:text-white/40 transition"
          />
          {filter.search && (
            <button
              onClick={() => setFilter((prev) => ({ ...prev, search: '' }))}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white/60 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Button */}
        <button
          onClick={onOpenFilterModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition border ${
            activeFilterCount > 0
              ? 'bg-sky-500/30 text-sky-200 border-sky-400/40'
              : 'bg-white/10 hover:bg-white/20 border-white/10 text-white/90'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{t.filter}</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-sky-400 text-slate-900 text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Theme Picker Dropdown */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 transition text-white/90"
            title={t.selectBackground}
          >
            <Palette className="w-4 h-4" />
          </button>

          {themeMenuOpen && (
            <div className="absolute left-0 md:right-0 md:left-auto top-full mt-2 w-52 rounded-xl bg-slate-900/95 border border-white/15 p-2 shadow-2xl backdrop-blur-xl z-50 text-slate-100">
              <div className="px-2 py-1 text-xs font-semibold text-white/60 mb-1 border-b border-white/10">
                {t.selectBackground}
              </div>
              <div className="space-y-1">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => handleSelectTheme(th.id as ThemeBackground)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/10 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full shadow border border-white/20"
                        style={{ backgroundColor: th.accentColor }}
                      />
                      <span>{lang === 'fa' ? th.nameFa : th.nameEn}</span>
                    </div>
                    {currentBoard?.background === th.id && (
                      <Check className="w-3.5 h-3.5 text-sky-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity Drawer Toggle */}
        <button
          onClick={onOpenActivityDrawer}
          className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 transition text-white/90"
          title={t.activity}
        >
          <History className="w-4 h-4" />
        </button>

        {/* Backup / Export / Import */}
        <button
          onClick={onOpenBackupModal}
          className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 transition text-white/90"
          title={t.exportImport}
        >
          <Download className="w-4 h-4" />
        </button>

        {/* FastAPI Python Backend Indicator */}
        <div
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
            backendHealthy
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
          }`}
        >
          <Database className="w-3 h-3" />
          <span>{backendHealthy ? 'FastAPI + پایتون فعال' : 'اتصال به FastAPI...'}</span>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold transition"
          title="تغییر زبان / Switch Language"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{lang === 'fa' ? 'EN' : 'فا'}</span>
        </button>

        {/* Current User Chip & Logout */}
        {currentUser && (
          <div className="flex items-center gap-2 pr-2 rtl:pr-2 rtl:border-r ltr:pl-2 ltr:border-l border-white/15">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 border border-white/10 text-xs">
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center shadow-xs">
                {currentUser.avatar || 'AP'}
              </div>
              <span className="font-semibold text-white/90 hidden sm:inline text-[11px]">
                {currentUser.username}
              </span>
              <span className="text-[10px] text-sky-300 font-medium hidden md:inline">
                ({currentUser.role === 'admin' ? 'ادمین' : 'کاربر'})
              </span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition text-xs flex items-center gap-1"
                title={lang === 'fa' ? 'خروج از حساب ادمین' : 'Logout'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px] font-semibold">
                  {lang === 'fa' ? 'خروج' : 'Logout'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
