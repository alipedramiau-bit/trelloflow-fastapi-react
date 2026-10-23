import React, { useState } from 'react';
import {
  Trello,
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Database,
  Languages,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { User as UserType } from '../types';
import { translations, type Language } from '../translations';
import { api } from '../api';

interface LoginScreenProps {
  onLoginSuccess: (user: UserType, token: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  backendHealthy: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  lang,
  setLang,
  backendHealthy,
}) => {
  const t = translations[lang];

  // Default credentials requested by user
  const [username, setUsername] = useState('AdminParsa');
  const [password, setPassword] = useState('Parsa@1405');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFillAdmin = () => {
    setUsername('AdminParsa');
    setPassword('Parsa@1405');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError(
        lang === 'fa'
          ? 'لطفاً نام کاربری و رمز عبور را وارد کنید'
          : 'Please enter both username and password'
      );
      return;
    }

    try {
      setLoading(true);
      const res = await api.login(username.trim(), password.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user, res.token);
      } else {
        setError(
          lang === 'fa'
            ? 'اطلاعات ورود نادرست است'
            : 'Invalid login credentials'
        );
      }
    } catch (err: any) {
      setError(
        err.message ||
          (lang === 'fa'
            ? 'خطا در برقراری ارتباط با سرور FastAPI'
            : 'Error connecting to FastAPI backend')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white relative overflow-hidden select-none">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Language and Backend Status */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md ${
            backendHealthy
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-950/70 text-amber-300 border-amber-500/40'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>
            {backendHealthy
              ? 'بک‌اند FastAPI متصل است'
              : 'در انتظار بک‌اند FastAPI...'}
          </span>
        </div>

        <button
          onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold backdrop-blur-md transition"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{lang === 'fa' ? 'English' : 'فارسی'}</span>
        </button>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-slate-900/90 border border-white/15 rounded-3xl shadow-2xl backdrop-blur-2xl p-6 sm:p-8 space-y-6 animate-fade-in z-10">
        {/* App Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/20 mb-1">
            <Trello className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {lang === 'fa' ? 'ورود به ترلوفلو' : 'Sign in to TrelloFlow'}
          </h1>
          <p className="text-xs text-slate-400">
            {lang === 'fa'
              ? 'سیستم مدیریت بصری وظایف با بک‌اند قدرتمند FastAPI و SQLite'
              : 'Kanban project & task management powered by FastAPI & SQLite'}
          </p>
        </div>

        {/* Quick Admin Credentials Callout Badge */}
        <div className="p-3.5 rounded-2xl bg-sky-950/50 border border-sky-500/30 text-xs space-y-2">
          <div className="flex items-center justify-between text-sky-300 font-bold">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>
                {lang === 'fa' ? 'حساب ادمین پیش‌فرض' : 'Default Admin Account'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleFillAdmin}
              className="text-[11px] text-sky-300 hover:text-white underline font-medium cursor-pointer"
            >
              {lang === 'fa' ? 'تکمیل خودکار فرم' : 'Auto-fill Form'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-black/40 p-2 rounded-xl border border-white/5">
            <div>
              <span className="text-slate-400 block">
                {lang === 'fa' ? 'نام کاربری:' : 'Username:'}
              </span>
              <span className="font-mono font-bold text-white text-xs">
                AdminParsa
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">
                {lang === 'fa' ? 'رمز عبور:' : 'Password:'}
              </span>
              <span className="font-mono font-bold text-white text-xs">
                Parsa@1405
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              {lang === 'fa' ? 'نام کاربری ادمین' : 'Admin Username'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="AdminParsa"
                className="w-full text-xs sm:text-sm py-2.5 rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 bg-slate-950/80 border border-white/15 focus:border-sky-400 rounded-xl outline-none text-white transition placeholder:text-slate-500 shadow-inner"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              {lang === 'fa' ? 'کلمه عبور' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parsa@1405"
                className="w-full text-xs sm:text-sm py-2.5 rtl:pr-9 rtl:pl-10 ltr:pl-9 ltr:pr-10 bg-slate-950/80 border border-white/15 focus:border-sky-400 rounded-xl outline-none text-white transition placeholder:text-slate-500 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 rtl:left-3 rtl:right-auto ltr:right-3 ltr:left-auto top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-60 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-sky-600/30 transition transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {lang === 'fa' ? 'در حال ورود...' : 'Signing in...'}
                </span>
              </>
            ) : (
              <>
                <span>
                  {lang === 'fa' ? 'ورود به پنل مدیریت' : 'Sign in to Dashboard'}
                </span>
                {lang === 'fa' ? (
                  <ArrowLeft className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 border-t border-white/10 text-center text-[11px] text-slate-500">
          {lang === 'fa'
            ? 'فرانت‌اند Vite و پکیج npm · بک‌اند FastAPI با دیتابیس SQLite'
            : 'Vite Frontend via npm · FastAPI Backend with SQLite'}
        </div>
      </div>
    </div>
  );
};
