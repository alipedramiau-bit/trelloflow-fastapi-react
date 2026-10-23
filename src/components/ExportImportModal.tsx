import React, { useState } from 'react';
import { X, Download, Upload, RotateCcw, Database, Check } from 'lucide-react';
import { translations, type Language } from '../translations';
import { api } from '../api';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onDataChanged: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  lang,
  onDataChanged,
}) => {
  const t = translations[lang];
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Export JSON
  const handleExport = async () => {
    try {
      setLoading(true);
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trelloflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccessMsg('فایل خروجی با موفقیت دانلود شد');
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در خروجی داده‌ها');
    } finally {
      setLoading(false);
    }
  };

  // Import JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setLoading(true);
        const json = JSON.parse(evt.target?.result as string);
        await api.importData(json);
        setSuccessMsg('داده‌ها با موفقیت بازیابی شدند');
        onDataChanged();
      } catch (err: any) {
        setErrorMsg('فایل نامعتبر است یا ساختار داده‌ها منطبق نیست: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Reset to default sample data
  const handleReset = async () => {
    if (!confirm(t.resetConfirm)) return;
    try {
      setLoading(true);
      await api.resetData();
      setSuccessMsg('دیتابیس پایتون با داده‌های نمونه بازنشانی شد');
      onDataChanged();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در بازنشانی داده‌ها');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {t.exportImport}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Messages */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3">
          {/* Export JSON */}
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-right"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-600 rounded-lg">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {t.exportData}
                </div>
                <div className="text-[11px] text-slate-500">
                  ذخیره تمام اطلاعات تخته‌ها و کارت‌ها در فرمت JSON
                </div>
              </div>
            </div>
          </button>

          {/* Import JSON */}
          <label className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-right">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-lg">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {t.importData}
                </div>
                <div className="text-[11px] text-slate-500">
                  بارگذاری و جایگزینی دیتابیس از فایل JSON
                </div>
              </div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Reset to Sample Data */}
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100/60 transition text-right"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-lg">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  {t.resetData}
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400">
                  بازگردانی تخته‌های نمونه اسپرینت ۱۴ و مارکتینگ
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
