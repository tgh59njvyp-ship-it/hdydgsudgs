import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parsePinterestBoardUrl,
  getOriginalImageUrl,
  deduplicatePins,
} from './src/utils/pinterest-url.ts';
import type { PinterestPin, BoardInfo, FetchBoardResponse } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// SSRF Protection: Allowed domains for proxying images
const ALLOWED_IMAGE_HOST_SUFFIXES = [
  '.pinimg.com',
  'pinimg.com',
  'images.unsplash.com', // For sample/demo boards
];

function isSafeImageUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Prevent local / private network SSRF
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname.startsWith('169.254.')
    ) {
      return false;
    }

    // Must match allowed image hosting domains
    const isAllowed = ALLOWED_IMAGE_HOST_SUFFIXES.some(
      (suffix) => hostname === suffix || hostname.endsWith(suffix)
    );

    return isAllowed;
  } catch {
    return false;
  }
}

// Sample fallback boards for reliable instant testing & demonstration
const SAMPLE_BOARDS: Record<string, { board: BoardInfo; pins: PinterestPin[] }> = {
  travel: {
    board: {
      name: 'Japan Travel & Scenic Spots',
      slug: 'japan-travel',
      owner: 'wanderlust_jp',
      url: 'https://www.pinterest.jp/wanderlust_jp/japan-travel/',
      description: '日本の美しい四季、京都の寺院、富士山、夜景などの絶景写真コレクション',
      pinCount: 16,
    },
    pins: [
      {
        id: 'sample-tr-1',
        title: '夕暮れの富士山と紅葉',
        description: '河口湖から望む富士山と鮮やかなもみじのトンネル',
        imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-tr-1/',
      },
      {
        id: 'sample-tr-2',
        title: '伏見稲荷大社の千本鳥居',
        description: '京都の幻想的な朱色の鳥居が続く神秘的な参道',
        imageUrl: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-tr-2/',
      },
      {
        id: 'sample-tr-3',
        title: '新宿のネオン煌めく夜街',
        description: '雨上がりの東京・新宿の路地とサイバーパンクな光',
        imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-tr-3/',
      },
      {
        id: 'sample-tr-4',
        title: '白川郷の合掌造りと雪景色',
        description: '冬の夜に温かい灯火が灯る世界遺産集落',
        imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-tr-4/',
      },
      {
        id: 'sample-tr-5',
        title: '奈良公園の鹿と春の桜',
        description: '満開の桜の下で寛ぐ愛らしい鹿たち',
        imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-tr-5/',
      },
      {
        id: 'sample-tr-6',
        title: '京都・嵐山の竹林の小径',
        description: '朝靄に包まれる静寂な青竹の道',
        imageUrl: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-tr-6/',
      },
      {
        id: 'sample-tr-7',
        title: '浅草・雷門と仲見世通り',
        description: '伝統的な大提灯と活気ある下町の風景',
        imageUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-tr-7/',
      },
      {
        id: 'sample-tr-8',
        title: '宮島・厳島神社の水中鳥居',
        description: '満潮時に瀬戸内海に浮かぶ荘厳な朱塗りの大鳥居',
        imageUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-tr-8/',
      },
      {
        id: 'sample-tr-9',
        title: '北海道・美瑛のパッチワークの路',
        description: '緑と黄金色の丘陵地帯がどこまでも続く広大な大地',
        imageUrl: 'https://images.unsplash.com/photo-1518182170546-07661fd94144?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1518182170546-07661fd94144?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-tr-9/',
      },
      {
        id: 'sample-tr-10',
        title: '沖縄・宮古島のコバルトブルーの海',
        description: '透明度抜群のエメラルドグリーンの珊瑚礁ビーチ',
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-tr-10/',
      },
      {
        id: 'sample-tr-11',
        title: '金閣寺（鹿苑寺）の雪化粧',
        description: '鏡湖池に映る黄金の舎利殿と静謐な白雪',
        imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-tr-11/',
      },
      {
        id: 'sample-tr-12',
        title: '東京タワーと夜景パノラマ',
        description: '大都会の中心にそびえる暖かなオレンジのランドマーク',
        imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-tr-12/',
      },
    ],
  },
  interior: {
    board: {
      name: 'Minimalist Interior Design',
      slug: 'minimal-interior',
      owner: 'interior_lover',
      url: 'https://www.pinterest.jp/interior_lover/minimal-interior/',
      description: '北欧モダン、木目とホワイトの心地よいミニマル空間のインテリア実例集',
      pinCount: 10,
    },
    pins: [
      {
        id: 'sample-in-1',
        title: '自然光が降り注ぐ北欧風リビング',
        description: 'オーク無垢材のローテーブルとライトグレーのファブリックソファ',
        imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-in-1/',
      },
      {
        id: 'sample-in-2',
        title: 'シンプルモダンなダイニングルーム',
        description: 'ペンダントライトと温もりのある木製チェアのコーディネート',
        imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-in-2/',
      },
      {
        id: 'sample-in-3',
        title: '観葉植物と静寂のワークスペース',
        description: '余計な物を置かないミニマルな書斎デスクとグリーン',
        imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-in-3/',
      },
      {
        id: 'sample-in-4',
        title: 'ホワイト＆ウッドのアイランドキッチン',
        description: '機能性と美しさを両立したクリーンなオープンキッチン',
        imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-in-4/',
      },
      {
        id: 'sample-in-5',
        title: '温かみのある心地よいベッドルーム',
        description: 'リネン素材の寝具と柔らかな間接照明',
        imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=2400&auto=format&fit=crop&q=100',
        width: 2400,
        height: 1600,
        pinUrl: 'https://www.pinterest.jp/pin/sample-in-5/',
      },
    ],
  },
};

// Check Pinterest API credentials and system status
app.get('/api/health', (req, res) => {
  const hasToken = !!process.env.PINTEREST_ACCESS_TOKEN?.trim();
  res.json({
    status: 'ok',
    hasPinterestToken: hasToken,
    timestamp: new Date().toISOString(),
  });
});

// Proxy image endpoint to bypass CORS and apply SSRF protection
app.get('/api/proxy-image', async (req, res) => {
  const targetUrl = req.query.url as string;

  if (!targetUrl) {
    return res.status(400).json({ error: '画像URLが指定されていません。' });
  }

  if (!isSafeImageUrl(targetUrl)) {
    return res.status(403).json({
      error: '許可されていないドメインまたは安全ではないURLです(SSRF防止)。i.pinimg.com などのPinterest公式ドメインを指定してください。',
    });
  }

  try {
    // Attempt fetch with fallback if original size returns 404
    let response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://www.pinterest.com/',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    // If /originals/ returned 404, fallback to /736x/ or /564x/
    if (response.status === 404 && targetUrl.includes('/originals/')) {
      const fallbackUrl = targetUrl.replace('/originals/', '/736x/');
      const fallbackResp = await fetch(fallbackUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://www.pinterest.com/',
        },
      });
      if (fallbackResp.ok) {
        response = fallbackResp;
      }
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: `画像取得エラー: HTTP ${response.status}`,
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    return res.send(buffer);
  } catch (err: any) {
    console.error('Proxy image error:', err.message);
    return res.status(502).json({
      error: `画像プロキシ通信失敗: ${err.message}`,
    });
  }
});

// Board retrieval logic
async function fetchBoardPinsFromPinterestApi(
  username: string,
  boardSlug: string,
  accessToken: string,
  maxItems: number
): Promise<{ board: BoardInfo; pins: PinterestPin[]; skippedCount: number; limitReached: boolean }> {
  // Pinterest API v5
  // First, find the board ID if needed or access /v5/boards/{board_id}
  // If user provided a slug, we can search boards or list user boards:
  // GET https://api.pinterest.com/v5/boards?page_size=100
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  };

  let boardId = '';
  let boardName = boardSlug;
  let boardDesc = '';

  try {
    const listBoardsRes = await fetch('https://api.pinterest.com/v5/boards?page_size=100', {
      headers,
    });
    if (listBoardsRes.ok) {
      const listData = await listBoardsRes.json();
      const matched = listData.items?.find(
        (b: any) =>
          b.name?.toLowerCase() === boardSlug.toLowerCase() ||
          b.id === boardSlug ||
          b.name?.toLowerCase().replace(/\s+/g, '-') === boardSlug.toLowerCase()
      );
      if (matched) {
        boardId = matched.id;
        boardName = matched.name || boardSlug;
        boardDesc = matched.description || '';
      }
    }
  } catch (e) {
    // ignore
  }

  // Fallback to board_id being boardSlug or formatted id
  const targetBoardId = boardId || boardSlug;

  const allPins: PinterestPin[] = [];
  let skippedCount = 0;
  let bookmark: string | undefined = undefined;
  let limitReached = false;

  while (allPins.length < maxItems) {
    const url = new URL(`https://api.pinterest.com/v5/boards/${encodeURIComponent(targetBoardId)}/pins`);
    url.searchParams.set('page_size', String(Math.min(100, maxItems - allPins.length)));
    if (bookmark) {
      url.searchParams.set('bookmark', bookmark);
    }

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Pinterest API エラー (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const items = data.items || [];

    for (const item of items) {
      if (allPins.length >= maxItems) {
        limitReached = true;
        break;
      }

      // Extract largest image
      const media = item.media?.images;
      let imgUrl = '';
      let width: number | undefined;
      let height: number | undefined;

      if (media?.originals?.url) {
        imgUrl = media.originals.url;
        width = media.originals.width;
        height = media.originals.height;
      } else if (media?.['1200x']?.url) {
        imgUrl = media['1200x'].url;
        width = media['1200x'].width;
        height = media['1200x'].height;
      } else if (media?.['600x']?.url) {
        imgUrl = media['600x'].url;
        width = media['600x'].width;
        height = media['600x'].height;
      }

      if (!imgUrl) {
        skippedCount++;
        continue;
      }

      allPins.push({
        id: item.id || `pin-${allPins.length + 1}`,
        title: item.title || item.alt_text || `Pin ${allPins.length + 1}`,
        description: item.description || '',
        imageUrl: imgUrl,
        originalUrl: getOriginalImageUrl(imgUrl),
        width,
        height,
        pinUrl: item.link || `https://www.pinterest.com/pin/${item.id}/`,
        created_at: item.created_at,
      });
    }

    if (!data.bookmark || items.length === 0) {
      break;
    }
    bookmark = data.bookmark;
  }

  return {
    board: {
      name: boardName,
      slug: boardSlug,
      owner: username,
      url: `https://www.pinterest.com/${username}/${boardSlug}/`,
      description: boardDesc,
      pinCount: allPins.length,
    },
    pins: allPins,
    skippedCount,
    limitReached,
  };
}

// Extract pins from public Pinterest board RSS feed
async function fetchBoardPinsFromRss(
  username: string,
  boardSlug: string,
  maxItems: number
): Promise<{ board: BoardInfo; pins: PinterestPin[]; skippedCount: number } | null> {
  const rssUrls = [
    `https://www.pinterest.com/${encodeURIComponent(username)}/${encodeURIComponent(boardSlug)}.rss`,
    `https://www.pinterest.jp/${encodeURIComponent(username)}/${encodeURIComponent(boardSlug)}.rss`,
  ];

  for (const rssUrl of rssUrls) {
    try {
      const res = await fetch(rssUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
      });

      if (!res.ok) continue;

      const xmlText = await res.text();
      if (!xmlText.includes('<item>')) continue;

      const boardTitleMatch = xmlText.match(/<channel>[\s\S]*?<title>(.*?)<\/title>/i);
      const boardTitle = boardTitleMatch ? boardTitleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : boardSlug;

      const items = xmlText.split('<item>').slice(1);
      const pins: PinterestPin[] = [];
      let skippedCount = 0;

      for (let i = 0; i < items.length && pins.length < maxItems; i++) {
        const item = items[i];
        const titleMatch = item.match(/<title>(.*?)<\/title>/i);
        const linkMatch = item.match(/<link>(.*?)<\/link>/i);
        const descMatch = item.match(/<description>([\s\S]*?)<\/description>/i);

        const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : `Pin ${i + 1}`;
        const pinUrl = linkMatch ? linkMatch[1].trim() : '';
        const descHtml = descMatch ? descMatch[1] : '';

        // Extract image src from description
        const imgMatch = descHtml.match(/src=["'](https?:\/\/[^"']+)["']/i);
        if (!imgMatch) {
          skippedCount++;
          continue;
        }

        const rawImgUrl = imgMatch[1];
        const origImgUrl = getOriginalImageUrl(rawImgUrl);

        pins.push({
          id: `rss-pin-${i + 1}`,
          title: title || `Pin ${i + 1}`,
          imageUrl: rawImgUrl,
          originalUrl: origImgUrl,
          pinUrl,
        });
      }

      if (pins.length > 0) {
        return {
          board: {
            name: boardTitle || boardSlug,
            slug: boardSlug,
            owner: username,
            url: `https://www.pinterest.com/${username}/${boardSlug}/`,
            pinCount: pins.length,
          },
          pins,
          skippedCount,
        };
      }
    } catch {
      // try next
    }
  }

  return null;
}

// Scrape public HTML if RSS and API are unavailable
async function fetchBoardPinsFromHtml(
  username: string,
  boardSlug: string,
  maxItems: number
): Promise<{ board: BoardInfo; pins: PinterestPin[]; skippedCount: number } | null> {
  const url = `https://www.pinterest.com/${encodeURIComponent(username)}/${encodeURIComponent(boardSlug)}/`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!res.ok) return null;

    const html = await res.text();

    // Look for __PWS_DATA__ or initial state
    const scriptMatch = html.match(/<script[^>]*id=["']__PWS_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
    if (scriptMatch) {
      try {
        const jsonData = JSON.parse(scriptMatch[1]);
        const boardData =
          jsonData?.props?.initialReduxState?.boards?.[Object.keys(jsonData.props.initialReduxState.boards || {})[0]] ||
          jsonData?.props?.initialData;

        // Collect all pin images found
        const pinImgRegex = /https:\/\/i\.pinimg\.com\/(?:236x|474x|564x|736x)\/[a-zA-Z0-9_\-/]+\.(?:jpg|png|webp)/g;
        const matches = Array.from(new Set(html.match(pinImgRegex) || []));

        if (matches.length > 0) {
          const pins: PinterestPin[] = matches.slice(0, maxItems).map((imgUrl, idx) => ({
            id: `scrape-${idx + 1}`,
            title: `Pin ${idx + 1}`,
            imageUrl: imgUrl,
            originalUrl: getOriginalImageUrl(imgUrl),
            pinUrl: url,
          }));

          return {
            board: {
              name: boardData?.name || boardSlug,
              slug: boardSlug,
              owner: username,
              url,
              pinCount: pins.length,
            },
            pins,
            skippedCount: 0,
          };
        }
      } catch {
        // fallback
      }
    }
  } catch {
    // ignore
  }

  return null;
}

// Main board retrieval endpoint
app.post('/api/pinterest/board', async (req, res) => {
  const { url, maxItems = 500 } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'PinterestのボードURLを入力してください。',
    });
  }

  // Parse and validate URL
  const parsed = parsePinterestBoardUrl(url);
  if (!parsed.isValid || !parsed.username || !parsed.boardSlug) {
    return res.status(400).json({
      success: false,
      error: parsed.errorMessage || 'ボードURLの形式が正しくありません。',
    });
  }

  const { username, boardSlug } = parsed;
  const token = process.env.PINTEREST_ACCESS_TOKEN?.trim();
  const limit = Math.min(Number(maxItems) || 500, 500);

  // 1. If API Token is configured, attempt official Pinterest API v5 first
  if (token) {
    try {
      const apiResult = await fetchBoardPinsFromPinterestApi(username, boardSlug, token, limit);
      const deduplicated = deduplicatePins(apiResult.pins);

      return res.json({
        success: true,
        board: apiResult.board,
        pins: deduplicated,
        skippedCount: apiResult.skippedCount,
        totalFound: deduplicated.length,
        limitReached: apiResult.limitReached || deduplicated.length >= limit,
        source: 'api',
        warning:
          apiResult.limitReached || deduplicated.length >= limit
            ? `上限件数(${limit}件)に達したため、取得を終了しました。`
            : undefined,
      } as FetchBoardResponse);
    } catch (err: any) {
      console.warn('Pinterest API v5 fetch failed, falling back to public feed:', err.message);
      // Fall through to public feed
    }
  }

  // 2. Attempt Public Board RSS Feed
  try {
    const rssResult = await fetchBoardPinsFromRss(username, boardSlug, limit);
    if (rssResult && rssResult.pins.length > 0) {
      const deduplicated = deduplicatePins(rssResult.pins);
      return res.json({
        success: true,
        board: rssResult.board,
        pins: deduplicated,
        skippedCount: rssResult.skippedCount,
        totalFound: deduplicated.length,
        limitReached: deduplicated.length >= limit,
        source: 'rss',
        warning:
          'Pinterest公開RSSフィードより取得しました。全件・大規模取得には開発者トークンの設定を推奨します。',
      } as FetchBoardResponse);
    }
  } catch (err: any) {
    console.warn('Pinterest RSS fetch error:', err.message);
  }

  // 3. Attempt Public Board HTML parsing
  try {
    const htmlResult = await fetchBoardPinsFromHtml(username, boardSlug, limit);
    if (htmlResult && htmlResult.pins.length > 0) {
      const deduplicated = deduplicatePins(htmlResult.pins);
      return res.json({
        success: true,
        board: htmlResult.board,
        pins: deduplicated,
        skippedCount: htmlResult.skippedCount,
        totalFound: deduplicated.length,
        limitReached: deduplicated.length >= limit,
        source: 'scrape',
        warning: 'Pinterest公開ページから取得しました。',
      } as FetchBoardResponse);
    }
  } catch (err: any) {
    console.warn('Pinterest HTML scrape error:', err.message);
  }

  // 4. Graceful demonstration fallback with curated high-res pins
  // Match keyword or pick sample
  const isInterior =
    boardSlug.includes('interior') ||
    boardSlug.includes('room') ||
    boardSlug.includes('furniture') ||
    boardSlug.includes('design');

  const chosenSample = isInterior ? SAMPLE_BOARDS.interior : SAMPLE_BOARDS.travel;

  const demoBoard: BoardInfo = {
    name: decodeURIComponent(boardSlug.replace(/-/g, ' ')),
    slug: boardSlug,
    owner: username,
    url: parsed.normalizedUrl || `https://www.pinterest.jp/${username}/${boardSlug}/`,
    description: `Pinterest公開制限または認証未設定のため、高品質プレビュー・検証用サンプル（${chosenSample.pins.length}件）を読み込みました。ZIP一括生成と全機能をお試しいただけます。`,
    pinCount: chosenSample.pins.length,
  };

  const deduplicated = deduplicatePins(chosenSample.pins);

  return res.json({
    success: true,
    board: demoBoard,
    pins: deduplicated,
    skippedCount: 0,
    totalFound: deduplicated.length,
    limitReached: false,
    source: 'demo',
    warning:
      'Pinterest APIトークン未設定または直接通信制限のため、全機能の動作確認が可能なデモモードで表示しています。ZIP一括保存もそのまま実行可能です。.envにPINTEREST_ACCESS_TOKENを設定すると本番API経由で取得できます。',
  } as FetchBoardResponse);
});

// Production & Dev Vite Middleware setup
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pinterest Downloader server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
