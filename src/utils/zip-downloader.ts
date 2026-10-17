import JSZip from 'jszip';
import type { PinterestPin, DownloadProgress } from '../types/index.ts';
import { formatSequentialFilename, formatZipFilename } from './pinterest-url.ts';

export interface BatchDownloadOptions {
  pins: PinterestPin[];
  boardName: string;
  concurrency?: number;
  preferOriginals?: boolean;
  onProgress: (progress: DownloadProgress) => void;
}

export interface BatchDownloadResult {
  success: boolean;
  total: number;
  succeeded: number;
  failedCount: number;
  zipFilename: string;
  blob?: Blob;
}

/**
 * Downloads a list of pins concurrently using a worker pool and bundles them into a ZIP file.
 * Resilient: skips failed pins without crashing, reports progress, and triggers download.
 */
export async function downloadPinsAsZip(options: BatchDownloadOptions): Promise<BatchDownloadResult> {
  const { pins, boardName, concurrency = 5, preferOriginals = true, onProgress } = options;

  if (pins.length === 0) {
    throw new Error('ダウンロードする画像が選択されていません。');
  }

  const zip = new JSZip();
  let completedCount = 0;
  let failedCount = 0;
  const total = pins.length;

  onProgress({
    status: 'downloading',
    current: 0,
    total,
    failedCount: 0,
    currentFilename: '準備中...',
  });

  // Worker pool for concurrency control
  let currentIndex = 0;

  async function worker(): Promise<void> {
    while (currentIndex < pins.length) {
      const pinIndex = currentIndex++;
      const pin = pins[pinIndex];
      const targetUrl = preferOriginals && pin.originalUrl ? pin.originalUrl : pin.imageUrl;
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(targetUrl)}`;

      try {
        const resp = await fetch(proxyUrl);
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }

        const contentType = resp.headers.get('content-type') || 'image/jpeg';
        const buffer = await resp.arrayBuffer();

        const filename = formatSequentialFilename(pinIndex + 1, total, targetUrl, contentType);
        zip.file(filename, buffer);

        completedCount++;
        onProgress({
          status: 'downloading',
          current: completedCount,
          total,
          failedCount,
          currentFilename: filename,
        });
      } catch (err) {
        console.warn(`Failed to download pin ${pin.id} (${targetUrl}):`, err);
        failedCount++;
        onProgress({
          status: 'downloading',
          current: completedCount,
          total,
          failedCount,
          currentFilename: `エラー: ピン #${pinIndex + 1}`,
        });
      }
    }
  }

  // Run workers in parallel up to concurrency limit
  const workerPool = Array.from({ length: Math.min(concurrency, pins.length) }, () => worker());
  await Promise.all(workerPool);

  if (completedCount === 0) {
    const errorMsg = 'すべての画像のダウンロードに失敗しました。接続状況またはURLをご確認ください。';
    onProgress({
      status: 'error',
      current: completedCount,
      total,
      failedCount,
      errorMessage: errorMsg,
    });
    throw new Error(errorMsg);
  }

  // Progress update: Zipping
  onProgress({
    status: 'zipping',
    current: completedCount,
    total,
    failedCount,
    currentFilename: 'ZIPアーカイブ生成中...',
  });

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress({
        status: 'zipping',
        current: Math.round((metadata.percent / 100) * total),
        total,
        failedCount,
        currentFilename: `ZIP圧縮中... ${Math.round(metadata.percent)}%`,
      });
    }
  );

  const zipFilename = formatZipFilename(boardName);

  // Trigger browser download
  const downloadUrl = URL.createObjectURL(zipBlob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = zipFilename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Release object URL after delay
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);

  onProgress({
    status: 'completed',
    current: completedCount,
    total,
    failedCount,
    zipBlob,
    zipFilename,
  });

  return {
    success: true,
    total,
    succeeded: completedCount,
    failedCount,
    zipFilename,
    blob: zipBlob,
  };
}
