import React from 'react';
import { X, Sliders, Zap } from 'lucide-react';
import type { DownloadSettings } from '../types/index.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DownloadSettings;
  onChangeSettings: (newSettings: DownloadSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ダウンロード設定"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              ダウンロード設定
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-5 text-xs sm:text-sm">
          {/* Concurrency Limit */}
          <div>
            <label className="block font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              同時ダウンロード並列数 (Rate Limit対策)
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
              サーバーとPinterest CDNへの同時接続数を制限します（推奨: 5並列）。
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 8, 10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChangeSettings({ ...settings, concurrency: val })}
                  className={`py-2 rounded-xl font-medium text-xs border transition ${
                    settings.concurrency === val
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {val} 並列
                </button>
              ))}
            </div>
          </div>

          {/* Max Items Limit */}
          <div>
            <label className="block font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              取得ピン件数の上限 (最大500件)
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
              ボード内の取得上限件数を指定します。
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[100, 250, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChangeSettings({ ...settings, maxPins: val })}
                  className={`py-2 rounded-xl font-medium text-xs border transition ${
                    settings.maxPins === val
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {val} 件
                </button>
              ))}
            </div>
          </div>

          {/* Resolution toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                オリジナル最高解像度を優先
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                originals フォルダの原寸無圧縮画像を優先取得します
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.preferOriginals}
              onChange={(e) => onChangeSettings({ ...settings, preferOriginals: e.target.checked })}
              className="w-4 h-4 text-red-600 rounded border-neutral-300 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-xs font-semibold transition"
          >
            設定を保存
          </button>
        </div>
      </div>
    </div>
  );
};
