import React from 'react';
import { ExternalLink, Maximize2, Check } from 'lucide-react';
import type { PinterestPin } from '../types/index.ts';

interface ImageGridProps {
  pins: PinterestPin[];
  selectedPinIds: Set<string>;
  onToggleSelect: (pinId: string) => void;
  onPreview: (pin: PinterestPin) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  pins,
  selectedPinIds,
  onToggleSelect,
  onPreview,
}) => {
  if (pins.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-neutral-500">
        ピンが見つかりませんでした。
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {pins.map((pin, index) => {
          const isSelected = selectedPinIds.has(pin.id);
          const indexLabel = `#${String(index + 1).padStart(3, '0')}`;

          return (
            <div
              key={pin.id}
              className={`group relative rounded-xl overflow-hidden border bg-white dark:bg-neutral-900 transition-all duration-200 select-none shadow-sm hover:shadow-md ${
                isSelected
                  ? 'border-red-500 ring-2 ring-red-500/40 dark:ring-red-500/30'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {/* Checkbox trigger overlay */}
              <button
                type="button"
                onClick={() => onToggleSelect(pin.id)}
                aria-label={`ピン ${index + 1} (${pin.title}) を${isSelected ? '選択解除' : '選択'}`}
                className="absolute top-2 left-2 z-10 w-7 h-7 rounded-lg flex items-center justify-center transition-all bg-black/40 backdrop-blur-sm text-white hover:scale-105"
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                    isSelected
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'border-white/80 bg-black/20 group-hover:border-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>

              {/* Index Number Badge */}
              <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/60 backdrop-blur-sm text-white">
                {indexLabel}
              </div>

              {/* Thumbnail Container */}
              <div
                className="aspect-square w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden cursor-pointer relative"
                onClick={() => onToggleSelect(pin.id)}
              >
                <img
                  src={pin.imageUrl}
                  alt={pin.title || `Pin ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback if image load fails
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                  }}
                />

                {/* Hover overlay with action buttons */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(pin);
                    }}
                    aria-label={`画像 ${index + 1} を拡大プレビュー`}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition"
                    title="拡大プレビュー"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  {pin.pinUrl && (
                    <a
                      href={pin.pinUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Pinterestで開く"
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition"
                      title="Pinterestで開く"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Title & Dimension Footer */}
              <div
                className="p-2.5 cursor-pointer"
                onClick={() => onToggleSelect(pin.id)}
              >
                <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                  {pin.title || `Pin ${index + 1}`}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                  <span>
                    {pin.width && pin.height ? `${pin.width}×${pin.height}` : '高解像度'}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    orig
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
