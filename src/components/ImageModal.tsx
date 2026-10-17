import React, { useEffect } from 'react';
import { X, ExternalLink, Download, ArrowRight, ArrowLeft } from 'lucide-react';
import type { PinterestPin } from '../types/index.ts';

interface ImageModalProps {
  pin: PinterestPin | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  pin,
  onClose,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  if (!pin) return null;

  const targetUrl = pin.originalUrl || pin.imageUrl;
  const proxyDownloadUrl = `/api/proxy-image?url=${encodeURIComponent(targetUrl)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="画像プレビュー"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[92vh] w-full flex flex-col bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 text-neutral-200">
          <div className="min-w-0 pr-4">
            <h3 className="font-semibold text-base truncate">{pin.title || '画像プレビュー'}</h3>
            {pin.description && (
              <p className="text-xs text-neutral-400 truncate mt-0.5">{pin.description}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {pin.pinUrl && (
              <a
                href={pin.pinUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition"
                title="Pinterestで開く"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
            <a
              href={proxyDownloadUrl}
              download={`${pin.id}.jpg`}
              className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition"
              title="この画像を保存"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="閉じる"
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image center area */}
        <div className="relative flex-1 flex items-center justify-center p-4 min-h-[300px] overflow-hidden bg-neutral-950">
          <img
            src={targetUrl}
            alt={pin.title || 'Pinterest Pin'}
            className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-lg"
          />

          {/* Navigation buttons */}
          {hasPrev && onPrev && (
            <button
              type="button"
              onClick={onPrev}
              aria-label="前の画像"
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {hasNext && onNext && (
            <button
              type="button"
              onClick={onNext}
              aria-label="次の画像"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div>
            URL: <span className="font-mono text-neutral-300 truncate inline-block max-w-[300px] sm:max-w-md align-bottom">{targetUrl}</span>
          </div>
          <div>
            {pin.width && pin.height ? `${pin.width} × ${pin.height} px` : 'オリジナル高解像度'}
          </div>
        </div>
      </div>
    </div>
  );
};
