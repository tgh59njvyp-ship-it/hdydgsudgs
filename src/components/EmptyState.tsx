import React from 'react';
import { DownloadCloud, ShieldCheck, Zap, Layers, FolderArchive, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  onSelectSample: (url: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectSample }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 3 Steps Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center mb-3 font-bold text-sm">
            1
          </div>
          <h4 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
            URLをペースト
          </h4>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            PinterestのボードURLをコピーして上の入力欄に貼り付けます。
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center mb-3 font-bold text-sm">
            2
          </div>
          <h4 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
            画像を確認・選択
          </h4>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            全ピンが一覧表示されます。個別チェックまたは「全選択」できます。
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center mb-3 font-bold text-sm">
            3
          </div>
          <h4 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
            ZIPを一括保存
          </h4>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            連番ファイル名(001.jpg, 002.png...)でZIP圧縮して自動保存されます。
          </p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 border border-neutral-200 dark:border-neutral-800">
        <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          主な特長と安心のセキュリティ設計
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-800 dark:text-neutral-200 block">オリジナル最高画質を抽出</strong>
              サムネイルだけでなく原寸（originals）を自動検出し、最高解像度でダウンロード。
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <FolderArchive className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-800 dark:text-neutral-200 block">JSZipによるインメモリ高速圧縮</strong>
              連番名付き(001.jpg〜)で重複画像を除外し、整理されたZIPで配布。
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-800 dark:text-neutral-200 block">CORS回避＆SSRF厳格防御</strong>
              サーバー側プロキシで安全に中継。i.pinimg.com などの公式ドメインのみ許可。
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-800 dark:text-neutral-200 block">同時実行制御＆エラー耐性</strong>
              5並列プール制御でRate Limitを回避。途中で一部画像が失敗しても最後までZIP化。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
