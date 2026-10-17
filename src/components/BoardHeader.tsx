import React from 'react';
import {
  Download,
  CheckSquare,
  Square,
  AlertTriangle,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import type { BoardInfo } from '../types/index.ts';

interface BoardHeaderProps {
  board: BoardInfo;
  totalPins: number;
  selectedCount: number;
  skippedCount: number;
  limitReached: boolean;
  source: 'api' | 'rss' | 'scrape' | 'demo';
  warning?: string;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onStartDownload: () => void;
  isDownloading: boolean;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  board,
  totalPins,
  selectedCount,
  skippedCount,
  limitReached,
  source,
  warning,
  onSelectAll,
  onDeselectAll,
  onStartDownload,
  isDownloading,
}) => {
  const isAllSelected = totalPins > 0 && selectedCount === totalPins;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      {/* Warning/Notification Banner */}
      {warning && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold mr-1.5">[お知らせ]</span>
            {warning}
          </div>
        </div>
      )}

      {/* Main Board Summary Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm transition">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Board metadata */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400">
                ボード
              </span>
              {source === 'api' && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                  Pinterest API v5
                </span>
              )}
              {source === 'rss' && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300">
                  公開RSS
                </span>
              )}
              {source === 'scrape' && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
                  公開Webページ
                </span>
              )}
              {source === 'demo' && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                  プレビューサンプル
                </span>
              )}
              {limitReached && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  取得上限(500件)到達
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
              {board.name || board.slug}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              <span>
                ユーザー: <strong className="text-neutral-800 dark:text-neutral-200">{board.owner}</strong>
              </span>
              <span>•</span>
              <a
                href={board.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline"
              >
                Pinterestで開く
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {skippedCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    ※ {skippedCount} 件の画像未取得ピンをスキップ
                  </span>
                </>
              )}
            </div>

            {board.description && (
              <p className="mt-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                {board.description}
              </p>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onStartDownload}
              disabled={isDownloading || selectedCount === 0}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm sm:text-base rounded-xl transition shadow-lg shadow-red-600/25 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download className="w-5 h-5" />
              <span>選択画像をZIP保存 ({selectedCount}件)</span>
            </button>
          </div>
        </div>

        {/* Bottom toolbar: Selection toggles and stats */}
        <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={isAllSelected ? onDeselectAll : onSelectAll}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-medium"
            >
              {isAllSelected ? (
                <>
                  <Square className="w-4 h-4 text-neutral-500" />
                  <span>全解除</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>全選択 ({totalPins}件)</span>
                </>
              )}
            </button>

            <span className="text-neutral-500 dark:text-neutral-400 ml-2">
              選択中: <strong className="text-neutral-900 dark:text-neutral-100">{selectedCount}</strong> / {totalPins} 件
            </span>
          </div>

          <div className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-neutral-400" />
            <span>オリジナル・最大解像度で一括圧縮</span>
          </div>
        </div>
      </div>
    </div>
  );
};
