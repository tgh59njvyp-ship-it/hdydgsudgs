export interface PinterestPin {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  originalUrl: string;
  width?: number;
  height?: number;
  pinUrl?: string;
  created_at?: string;
}

export interface BoardInfo {
  name: string;
  slug: string;
  owner: string;
  url: string;
  description?: string;
  pinCount?: number;
}

export interface FetchBoardResponse {
  success: boolean;
  board: BoardInfo;
  pins: PinterestPin[];
  skippedCount: number;
  totalFound: number;
  limitReached: boolean;
  source: 'api' | 'rss' | 'scrape' | 'demo';
  warning?: string;
  error?: string;
}

export interface DownloadProgress {
  status: 'idle' | 'downloading' | 'zipping' | 'completed' | 'error';
  current: number;
  total: number;
  failedCount: number;
  currentFilename?: string;
  errorMessage?: string;
  zipBlob?: Blob;
  zipFilename?: string;
}

export interface DownloadSettings {
  concurrency: number;
  maxPins: number;
  preferOriginals: boolean;
}
