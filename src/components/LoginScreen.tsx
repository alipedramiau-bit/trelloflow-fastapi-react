import React, { useState } from 'react';
import {
  Trello,
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Database,
  Languages,
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
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden select-none"
      style={{
        backgroundColor: '#090d16',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #090d16 75%)',
        color: '#f8fafc',
      }}
    >
      {/* Top Bar with Language and Backend Status */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
          style={{
            backgroundColor: backendHealthy ? 'rgba(6, 78, 59, 0.8)' : 'rgba(120, 53, 15, 0.8)',
            color: backendHealthy ? '#6ee7b7' : '#fcd34d',
            borderColor: backendHealthy ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)',
          }}
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: '1px',
            color: '#ffffff',
          }}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{lang === 'fa' ? 'English' : 'فارسی'}</span>
        </button>
      </div>

      {/* Login Card */}
      <div
        className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl z-10"
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1f2937',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* App Logo & Title */}
        <div className="text-center space-y-2">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white shadow-lg mb-1"
            style={{
              backgroundColor: '#2563eb',
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
            }}
          >
            <Trello className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white" style={{ color: '#ffffff' }}>
            {lang === 'fa' ? 'ورود به ترلوفلو' : 'Sign in to TrelloFlow'}
          </h1>
          <p className="text-xs text-slate-400" style={{ color: '#94a3b8' }}>
            {lang === 'fa'
              ? 'سیستم مدیریت بصری وظایف با بک‌اند قدرتمند FastAPI و SQLite'
              : 'Kanban project & task management powered by FastAPI & SQLite'}
          </p>
        </div>

        {/* Quick Admin Credentials Callout Badge */}
        <div
          className="p-3.5 rounded-2xl text-xs space-y-2"
          style={{
            backgroundColor: '#0c1a32',
            border: '1px solid #1d4ed8',
          }}
        >
          <div className="flex items-center justify-between font-bold" style={{ color: '#e2e8f0' }}>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {lang === 'fa' ? 'حساب ادمین پیش‌فرض' : 'Default Admin Account'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleFillAdmin}
              className="text-[11px] underline font-medium cursor-pointer transition hover:text-white"
              style={{ color: '#e2e8f0' }}
            >
              {lang === 'fa' ? 'تکمیل خودکار فرم' : 'Auto-fill Form'}
            </button>
          </div>

          <div
            className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl border"
            style={{
              backgroundColor: '#070d19',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div>
              <span className="block text-[11px]" style={{ color: '#94a3b8' }}>
                {lang === 'fa' ? 'نام کاربری:' : 'Username:'}
              </span>
              <span className="font-mono font-bold text-xs" style={{ color: '#f8fafc' }}>
                AdminParsa
              </span>
            </div>
            <div>
              <span className="block text-[11px]" style={{ color: '#94a3b8' }}>
                {lang === 'fa' ? 'رمز عبور:' : 'Password:'}
              </span>
              <span className="font-mono font-bold text-xs" style={{ color: '#f8fafc' }}>
                Parsa@1405
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="p-3 text-xs rounded-xl flex items-center gap-2 border"
            style={{
              backgroundColor: 'rgba(136, 19, 55, 0.6)',
              borderColor: 'rgba(244, 63, 94, 0.4)',
              color: '#fda4af',
            }}
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold" style={{ color: '#cbd5e1' }}>
              {lang === 'fa' ? 'نام کاربری ادمین' : 'Admin Username'}
            </label>
            <div className="relative">
              <User
                className="w-4 h-4 absolute right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto top-1/2 -translate-y-1/2"
                style={{ color: '#94a3b8' }}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="AdminParsa"
                className="w-full text-xs sm:text-sm py-2.5 rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 rounded-xl outline-none transition"
                style={{
                  backgroundColor: '#0b0f19',
                  border: '1px solid #374151',
                  color: '#ffffff',
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold" style={{ color: '#cbd5e1' }}>
              {lang === 'fa' ? 'کلمه عبور' : 'Password'}
            </label>
            <div className="relative">
              <Lock
                className="w-4 h-4 absolute right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto top-1/2 -translate-y-1/2"
                style={{ color: '#94a3b8' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parsa@1405"
                className="w-full text-xs sm:text-sm py-2.5 rtl:pr-9 rtl:pl-10 ltr:pl-9 ltr:pr-10 rounded-xl outline-none transition"
                style={{
                  backgroundColor: '#0b0f19',
                  border: '1px solid #374151',
                  color: '#ffffff',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 rtl:left-3 rtl:right-auto ltr:right-3 ltr:left-auto top-1/2 -translate-y-1/2 transition"
                style={{ color: '#94a3b8' }}
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
            className="w-full py-3 text-xs sm:text-sm font-bold rounded-xl shadow-lg transition transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
            }}
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
        <div
          className="pt-2 border-t text-center text-[11px]"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.1)',
            color: '#64748b',
          }}
        >
          {lang === 'fa'
            ? 'فرانت‌اند Vite و پکیج npm · بک‌اند FastAPI با دیتابیس SQLite'
            : 'Vite Frontend via npm · FastAPI Backend with SQLite'}
        </div>
      </div>
    </div>
  );
};
