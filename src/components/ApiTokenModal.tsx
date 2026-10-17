import React from 'react';
import { X, KeyRound, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ApiTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasApiToken: boolean;
}

export const ApiTokenModal: React.FC<ApiTokenModalProps> = ({
  isOpen,
  onClose,
  hasApiToken,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pinterest API連携ガイド"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                Pinterest API v5 連携設定
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                現在のステータス: {hasApiToken ? '✅ トークン設定済み' : '⚡ 公開フィード/デモモードで動作中'}
              </p>
            </div>
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

        <div className="my-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 space-y-4">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs">
            <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              トークンがなくても使える機能
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              公開ボードのRSSフィード取得・HTML解析・サンプルプレビュー機能により、トークンを設定しなくてもZIP一括保存をお試しいただけます。
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              APIアクセストークン取得手順 (約3分)
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              <li>
                <a
                  href="https://developers.pinterest.com/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-red-600 dark:text-red-400 font-medium hover:underline inline-flex items-center gap-1"
                >
                  Pinterest Developers ポータル
                  <ExternalLink className="w-3 h-3" />
                </a>
                にアクセスし、Pinterestビジネスアカウントでログインします。
              </li>
              <li>
                「<strong>My Apps</strong>」から「<strong>Create App</strong>」をクリックして新規アプリを作成します。
              </li>
              <li>
                必要な権限スコープ (<code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono">boards:read</code>, <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono">pins:read</code>) を選択します。
              </li>
              <li>
                開発用アクセストークン (Access Token) を発行・コピーします。
              </li>
              <li>
                プロジェクトの環境変数または <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono">.env</code> に次のように設定します:
                <pre className="mt-1.5 p-2 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-[11px] overflow-x-auto">
                  PINTEREST_ACCESS_TOKEN="pina_..."
                </pre>
              </li>
            </ol>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs">
            <p className="font-semibold mb-1">セキュリティについて</p>
            <p>
              トークンはサーバー側（server.ts）でのみ安全に利用され、ブラウザのクライアント側に露出することはありません。
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-xs font-semibold transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
