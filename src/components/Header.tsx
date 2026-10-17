import React from 'react';
import { DownloadCloud, Moon, Sun, KeyRound, Sliders, ExternalLink } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenApiGuide: () => void;
  onOpenSettings: () => void;
  hasApiToken: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  onOpenApiGuide,
  onOpenSettings,
  hasApiToken,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/20 font-bold text-xl tracking-tighter">
            P
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg sm:text-xl text-neutral-900 dark:text-neutral-100 tracking-tight leading-none">
                Pinterest Downloader
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-medium">
                ZIP一括保存
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block mt-0.5">
              ボードの全画像をオリジナル画質でまとめてダウンロード
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* API Status / Guide */}
          <button
            onClick={onOpenApiGuide}
            type="button"
            aria-label="API連携ガイド"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">API設定</span>
            <span
              className={`w-2 h-2 rounded-full ${
                hasApiToken ? 'bg-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-900' : 'bg-neutral-400'
              }`}
              title={hasApiToken ? 'Pinterest API v5 連携中' : '公開フィード / デモモード'}
            />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            type="button"
            aria-label="ダウンロード設定"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            title="ダウンロード設定"
          >
            <Sliders className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            type="button"
            aria-label={isDark ? 'ライトモードに切替' : 'ダークモードに切替'}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-neutral-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
