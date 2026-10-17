/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { UrlInputForm } from './components/UrlInputForm.tsx';
import { BoardHeader } from './components/BoardHeader.tsx';
import { ImageGrid } from './components/ImageGrid.tsx';
import { ImageModal } from './components/ImageModal.tsx';
import { DownloadProgressModal } from './components/DownloadProgressModal.tsx';
import { ApiTokenModal } from './components/ApiTokenModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { EmptyState } from './components/EmptyState.tsx';
import { downloadPinsAsZip } from './utils/zip-downloader.ts';
import type {
  PinterestPin,
  BoardInfo,
  FetchBoardResponse,
  DownloadProgress,
  DownloadSettings,
} from './types/index.ts';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // System status
  const [hasApiToken, setHasApiToken] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data?.hasPinterestToken) {
          setHasApiToken(true);
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  // Board and pins data
  const [board, setBoard] = useState<BoardInfo | null>(null);
  const [pins, setPins] = useState<PinterestPin[]>([]);
  const [selectedPinIds, setSelectedPinIds] = useState<Set<string>>(new Set());
  const [skippedCount, setSkippedCount] = useState<number>(0);
  const [limitReached, setLimitReached] = useState<boolean>(false);
  const [source, setSource] = useState<'api' | 'rss' | 'scrape' | 'demo'>('demo');
  const [warningMessage, setWarningMessage] = useState<string | undefined>(undefined);

  // Loading and Error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastSubmittedUrl, setLastSubmittedUrl] = useState<string>('');

  // Modals state
  const [previewPin, setPreviewPin] = useState<PinterestPin | null>(null);
  const [isApiGuideOpen, setIsApiGuideOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<DownloadSettings>({
    concurrency: 5,
    maxPins: 500,
    preferOriginals: true,
  });

  // Download Progress state
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    status: 'idle',
    current: 0,
    total: 0,
    failedCount: 0,
  });

  // Fetch board handler
  const handleFetchBoard = async (url: string) => {
    setIsLoading(true);
    setFetchError(null);
    setLastSubmittedUrl(url);

    try {
      const response = await fetch('/api/pinterest/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, maxItems: settings.maxPins }),
      });

      const data: FetchBoardResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `ボード取得に失敗しました (HTTP ${response.status})`);
      }

      setBoard(data.board);
      setPins(data.pins);
      // Auto select all pins by default
      setSelectedPinIds(new Set(data.pins.map((p) => p.id)));
      setSkippedCount(data.skippedCount || 0);
      setLimitReached(!!data.limitReached);
      setSource(data.source);
      setWarningMessage(data.warning);
    } catch (err: any) {
      console.error('Fetch board failed:', err);
      setFetchError(err.message || 'ボード情報の取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // Selection handlers
  const handleToggleSelect = (pinId: string) => {
    setSelectedPinIds((prev) => {
      const next = new Set(prev);
      if (next.has(pinId)) {
        next.delete(pinId);
      } else {
        next.add(pinId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedPinIds(new Set(pins.map((p) => p.id)));
  };

  const handleDeselectAll = () => {
    setSelectedPinIds(new Set());
  };

  // Batch ZIP Download handler
  const handleStartDownload = async () => {
    if (!board) return;

    const selectedPins = pins.filter((p) => selectedPinIds.has(p.id));
    if (selectedPins.length === 0) return;

    try {
      await downloadPinsAsZip({
        pins: selectedPins,
        boardName: board.slug || board.name,
        concurrency: settings.concurrency,
        preferOriginals: settings.preferOriginals,
        onProgress: setDownloadProgress,
      });
    } catch (err: any) {
      console.error('Download as ZIP failed:', err);
    }
  };

  // Lightbox preview navigation
  const currentPreviewIndex = previewPin ? pins.findIndex((p) => p.id === previewPin.id) : -1;
  const hasPrev = currentPreviewIndex > 0;
  const hasNext = currentPreviewIndex !== -1 && currentPreviewIndex < pins.length - 1;

  const handleNextPreview = () => {
    if (hasNext) {
      setPreviewPin(pins[currentPreviewIndex + 1]);
    }
  };

  const handlePrevPreview = () => {
    if (hasPrev) {
      setPreviewPin(pins[currentPreviewIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans selection:bg-red-500 selection:text-white transition-colors">
      {/* Header */}
      <Header
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onOpenApiGuide={() => setIsApiGuideOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiToken={hasApiToken}
      />

      {/* Main Container */}
      <main className="flex-1">
        {/* URL Input Form */}
        <UrlInputForm
          onSubmit={handleFetchBoard}
          isLoading={isLoading}
          onOpenApiGuide={() => setIsApiGuideOpen(true)}
        />

        {/* Global Fetch Error Banner */}
        {fetchError && (
          <div className="max-w-4xl mx-auto px-4 mb-6">
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <div className="flex-1 text-sm">
                <p className="font-semibold">ボードの読み込みに失敗しました</p>
                <p className="mt-1 text-xs opacity-90">{fetchError}</p>
                {lastSubmittedUrl && (
                  <button
                    type="button"
                    onClick={() => handleFetchBoard(lastSubmittedUrl)}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs font-medium transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    再試行する
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Board content or Empty State */}
        {board && pins.length > 0 ? (
          <>
            <BoardHeader
              board={board}
              totalPins={pins.length}
              selectedCount={selectedPinIds.size}
              skippedCount={skippedCount}
              limitReached={limitReached}
              source={source}
              warning={warningMessage}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onStartDownload={handleStartDownload}
              isDownloading={downloadProgress.status === 'downloading' || downloadProgress.status === 'zipping'}
            />

            <ImageGrid
              pins={pins}
              selectedPinIds={selectedPinIds}
              onToggleSelect={handleToggleSelect}
              onPreview={(pin) => setPreviewPin(pin)}
            />
          </>
        ) : (
          !isLoading && <EmptyState onSelectSample={handleFetchBoard} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 px-4 text-center text-xs text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 transition-colors">
        <p>
          Pinterest Board Image Batch Downloader • 高解像度オリジナル画像一括取得 & ZIP保存
        </p>
        <p className="mt-1 text-[11px] opacity-75">
          Pinterest™ は Pinterest, Inc. の商標です。本ツールは個人利用および研究開発目的のオープンソースWebツールです。
        </p>
      </footer>

      {/* Modals */}
      <ImageModal
        pin={previewPin}
        onClose={() => setPreviewPin(null)}
        onNext={handleNextPreview}
        onPrev={handlePrevPreview}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      <DownloadProgressModal
        progress={downloadProgress}
        onClose={() => setDownloadProgress({ status: 'idle', current: 0, total: 0, failedCount: 0 })}
      />

      <ApiTokenModal
        isOpen={isApiGuideOpen}
        onClose={() => setIsApiGuideOpen(false)}
        hasApiToken={hasApiToken}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onChangeSettings={setSettings}
      />
    </div>
  );
}
