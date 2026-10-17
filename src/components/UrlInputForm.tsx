import React, { useState } from 'react';
import { Search, AlertCircle, Loader2, X, Sparkles, HelpCircle } from 'lucide-react';
import { parsePinterestBoardUrl } from '../utils/pinterest-url.ts';

interface UrlInputFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  onOpenApiGuide: () => void;
}

const SAMPLE_BOARDS = [
  {
    label: '🗾 日本の絶景・旅行',
    url: 'https://www.pinterest.jp/wanderlust_jp/japan-travel/',
  },
  {
    label: '🛋️ ミニマルインテリア',
    url: 'https://www.pinterest.jp/interior_lover/minimal-interior/',
  },
  {
    label: '🎨 アート・デザインポスター',
    url: 'https://www.pinterest.com/design_inspiration/modern-posters/',
  },
];

export const UrlInputForm: React.FC<UrlInputFormProps> = ({
  onSubmit,
  isLoading,
  onOpenApiGuide,
}) => {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsed = parsePinterestBoardUrl(url);
    if (!parsed.isValid) {
      setValidationError(parsed.errorMessage || 'ボードURLの形式が正しくありません。');
      return;
    }

    onSubmit(url.trim());
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setValidationError(null);
    onSubmit(sampleUrl);
  };

  const handleClear = () => {
    setUrl('');
    setValidationError(null);
  };

  return (
    <section className="w-full max-w-4xl mx-auto py-6 sm:py-8 px-4">
      {/* Intro headline */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Pinterest ボードの画像をまとめてZIP保存
        </h2>
        <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          ボードのURLを入力するだけで、ピンの最大解像度画像を一括抽出・連番付きZIPで高速ダウンロード
        </p>
      </div>

      {/* Main input form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-neutral-950/60 border border-neutral-200 dark:border-neutral-800 transition-all focus-within:ring-2 focus-within:ring-red-500/50">
          <div className="relative flex-1 flex items-center min-w-0">
            <Search className="w-5 h-5 ml-3 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="https://www.pinterest.jp/ユーザー名/ボード名/"
              aria-label="Pinterest ボードURL"
              disabled={isLoading}
              className="w-full px-3 py-3 text-sm sm:text-base bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none disabled:opacity-60"
            />
            {url && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="入力をクリア"
                className="p-1.5 mr-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium text-sm sm:text-base rounded-xl transition shadow-md shadow-red-600/25 disabled:opacity-50 disabled:pointer-events-none shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>ボード解析中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>画像を取得</span>
              </>
            )}
          </button>
        </div>

        {/* Validation error display */}
        {validationError && (
          <div className="mt-3 flex items-start space-x-2 p-3 text-sm rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <p className="font-medium">{validationError}</p>
              <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
                入力例: <code className="bg-red-100 dark:bg-red-900/40 px-1 py-0.5 rounded">https://www.pinterest.jp/username/board-name/</code>
              </p>
            </div>
          </div>
        )}
      </form>

      {/* Quick sample chips */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
        <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          ワンクリックでお試し:
        </span>
        {SAMPLE_BOARDS.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => handleSelectSample(sample.url)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium transition disabled:opacity-50"
          >
            {sample.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onOpenApiGuide}
          className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 underline underline-offset-2 ml-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          非公開・大規模ボードの取得方法
        </button>
      </div>
    </section>
  );
};
