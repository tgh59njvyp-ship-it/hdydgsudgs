import type { PinterestPin } from '../types/index.ts';

export interface ParsedBoardUrl {
  isValid: boolean;
  username?: string;
  boardSlug?: string;
  normalizedUrl?: string;
  errorMessage?: string;
}

/**
 * Validates and extracts username and board slug from a Pinterest board URL.
 * Supports pinterest.com, pinterest.jp, and other international domains.
 */
export function parsePinterestBoardUrl(rawUrl: string): ParsedBoardUrl {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: 'URLを入力してください。',
    };
  }

  let urlObj: URL;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    urlObj = new URL(withProtocol);
  } catch {
    return {
      isValid: false,
      errorMessage: '有効なURL形式ではありません。(例: https://www.pinterest.jp/username/board-name/)',
    };
  }

  const hostname = urlObj.hostname.toLowerCase();
  const isPinterestDomain =
    hostname === 'pinterest.com' ||
    hostname.endsWith('.pinterest.com') ||
    hostname === 'pinterest.jp' ||
    hostname.endsWith('.pinterest.jp') ||
    hostname === 'pin.it' ||
    /pinterest\.[a-z]{2,3}(\.[a-z]{2})?$/i.test(hostname);

  if (!isPinterestDomain) {
    return {
      isValid: false,
      errorMessage: 'PinterestのURLを入力してください。(pinterest.com または pinterest.jp)',
    };
  }

  // Remove leading and trailing slashes and split path
  const pathSegments = urlObj.pathname
    .split('/')
    .filter((segment) => segment.length > 0 && !segment.startsWith('_'));

  // If path is pin.it shortlink, it needs redirect resolution (or inform user)
  if (hostname === 'pin.it') {
    return {
      isValid: false,
      errorMessage: '短縮URL (pin.it) ではなく、ブラウザで展開されたボードURLを入力してください。',
    };
  }

  // A board URL typically has at least two segments: /username/board-name/
  // Some locales might prefix language /_/_ or pin URLs /pin/12345
  if (pathSegments.length < 2) {
    return {
      isValid: false,
      errorMessage: 'ボードURLの形式が正しくありません。ユーザー名とボード名が含まれている必要があります。(例: https://www.pinterest.jp/username/board-name/)',
    };
  }

  const firstSeg = pathSegments[0].toLowerCase();
  if (firstSeg === 'pin' || firstSeg === 'search' || firstSeg === 'ideas' || firstSeg === 'today') {
    return {
      isValid: false,
      errorMessage: '単一のピンや検索ページではなく、Pinterestの「ボード」URLを入力してください。',
    };
  }

  const username = decodeURIComponent(pathSegments[0]);
  const boardSlug = decodeURIComponent(pathSegments[1]);

  if (!username || !boardSlug) {
    return {
      isValid: false,
      errorMessage: 'ボードURLからユーザー名またはボード名を特定できませんでした。',
    };
  }

  return {
    isValid: true,
    username,
    boardSlug,
    normalizedUrl: `https://www.pinterest.com/${encodeURIComponent(username)}/${encodeURIComponent(boardSlug)}/`,
  };
}

/**
 * Generates original high-resolution URL from Pinterest CDN URL.
 * e.g., converts /236x/, /474x/, /564x/, /736x/ or /1200x/ to /originals/
 */
export function getOriginalImageUrl(url: string): string {
  if (!url) return '';
  if (url.includes('i.pinimg.com') || url.includes('pinimg.com')) {
    return url.replace(/\/(?:236x|474x|564x|736x|1200x)\//, '/originals/');
  }
  return url;
}

/**
 * Extracts or infers file extension from URL or MIME type.
 */
export function inferFileExtension(url: string, mimeType?: string): string {
  if (mimeType) {
    const lowerMime = mimeType.toLowerCase();
    if (lowerMime.includes('png')) return 'png';
    if (lowerMime.includes('webp')) return 'webp';
    if (lowerMime.includes('gif')) return 'gif';
    if (lowerMime.includes('jpeg') || lowerMime.includes('jpg')) return 'jpg';
  }

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]{3,4})(?:$|\?)/);
    if (match) {
      const ext = match[1].toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        return ext === 'jpeg' ? 'jpg' : ext;
      }
    }
  } catch {
    // ignore
  }

  return 'jpg';
}

/**
 * Formats sequential filename for images inside the ZIP.
 * e.g., 001.jpg, 002.png (padded to at least 3 digits).
 */
export function formatSequentialFilename(
  index: number,
  total: number,
  originalUrl: string,
  mimeType?: string
): string {
  const digits = Math.max(3, String(total).length);
  const paddedIndex = String(index).padStart(digits, '0');
  const ext = inferFileExtension(originalUrl, mimeType);
  return `${paddedIndex}.${ext}`;
}

/**
 * Formats ZIP filename: {board-name}_{YYYY-MM-DD}.zip
 */
export function formatZipFilename(boardName: string, date: Date = new Date()): string {
  // Sanitize board name: replace invalid filename chars with hyphens
  const sanitized = boardName
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 50) || 'pinterest_board';

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${sanitized}_${yyyy}-${mm}-${dd}.zip`;
}

/**
 * Deduplicates pins by their original or main image URL.
 */
export function deduplicatePins(pins: PinterestPin[]): PinterestPin[] {
  const seenUrls = new Set<string>();
  const uniquePins: PinterestPin[] = [];

  for (const pin of pins) {
    const targetUrl = (pin.originalUrl || pin.imageUrl).trim();
    if (!targetUrl) continue;
    if (!seenUrls.has(targetUrl)) {
      seenUrls.add(targetUrl);
      uniquePins.push(pin);
    }
  }

  return uniquePins;
}
