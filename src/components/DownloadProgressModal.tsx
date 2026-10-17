import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Download, X, Archive, FileText } from 'lucide-react';
import type { DownloadProgress } from '../types/index.ts';

interface DownloadProgressModalProps {
  progress: DownloadProgress;
  onClose: () => void;
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
  progress,
  onClose,
}) => {
  const { status, current, total, failedCount, currentFilename, errorMessage, zipBlob, zipFilename } =
    progress;

  if (status === 'idle') return null;

  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const isFinished = status === 'completed' || status === 'error';

  const handleDownloadAgain = () => {
    if (!zipBlob || !zipFilename) return;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ZIPダウンロード進捗"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
    >
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                status === 'completed'
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
                  : status === 'error'
                  ? 'bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400'
                  : 'bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400'
              }`}
            >
              {status === 'completed' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : status === 'error' ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Archive className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                {status === 'completed'
                  ? 'ZIPダウンロード完了'
                  : status === 'error'
                  ? 'ダウンロード失敗'
                  : status === 'zipping'
                  ? 'ZIPアーカイブ生成中'
                  : '画像をダウンロード中'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {status === 'zipping'
                  ? '取得した画像ファイルをZIPに圧縮しています'
                  : status === 'completed'
                  ? 'ブラウザのダウンロードフォルダをご確認ください'
                  : 'サーバー経由で高速並列ダウンロードを行っています'}
              </p>
            </div>
          </div>

          {isFinished && (
            <button
              type="button"
              onClick={onClose}
              aria-label="閉じる"
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar & Counter */}
        {status !== 'error' && (
          <div className="my-5">
            <div className="flex justify-between text-xs font-semibold mb-1.5 text-neutral-700 dark:text-neutral-300">
              <span>進捗率</span>
              <span className="font-mono">{percentage}% ({current} / {total} 件)</span>
            </div>

            <div className="w-full h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  status === 'completed' ? 'bg-emerald-500' : 'bg-red-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {currentFilename && (
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 truncate font-mono">
                処理中: {currentFilename}
              </p>
            )}
          </div>
        )}

        {/* Error message if any */}
        {errorMessage && (
          <div className="p-3 my-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Warning about failed items */}
        {failedCount > 0 && (
          <div className="p-3 my-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
            <span>※ {failedCount} 件の画像取得に失敗しました (除外して続行)</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          {status === 'completed' && zipBlob && (
            <button
              type="button"
              onClick={handleDownloadAgain}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition"
            >
              <Download className="w-4 h-4" />
              <span>もう一度ダウンロード</span>
            </button>
          )}

          {isFinished ? (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-xs font-semibold transition"
            >
              完了
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400">
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              <span>処理が完了するまでブラウザを閉じないでください</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
