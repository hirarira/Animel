// サムネイルの対応表（tid → ファイル名）は、画像と同じ静的ディレクトリに置いた
// thumbnails.json から読み込む。リポジトリにもコードにも埋め込まないので、
// サムネを増やすときは画像とJSONを置くだけでよい（Animelの再デプロイ不要）。
// 例: { "2077": "2077.png", "2142": "2142.jpg" }（拡張子はファイル名側で自由）

// デフォルトは同一オリジンの <base>/thumbs/（例: /Animel/thumbs/）。
// 別サーバーに置く場合は環境変数 VITE_THUMBNAIL_BASE_URL で上書きする。
const THUMBNAIL_BASE = (
  import.meta.env.VITE_THUMBNAIL_BASE_URL
  ?? `${import.meta.env.BASE_URL}thumbs/`
).replace(/\/?$/, '/');

export type ThumbnailMap = Map<number, string>;

let cache: Promise<ThumbnailMap> | null = null;

// thumbnails.json を読み、tid → サムネイル完全URL のMapを返す。
// 読めなかった場合は空のMap（サムネなし＝従来表示）。
export const loadThumbnailMap = (): Promise<ThumbnailMap> => {
  if (!cache) {
    cache = (async () => {
      const map: ThumbnailMap = new Map();
      try {
        const response = await fetch(`${THUMBNAIL_BASE}thumbnails.json`);
        if (!response.ok) {
          console.warn(`[Animel] thumbnails.json を読み込めませんでした (HTTP ${response.status}): ${THUMBNAIL_BASE}thumbnails.json`);
        }
        if (response.ok) {
          const data: Record<string, string> = await response.json();
          Object.entries(data).forEach(([tid, file]) => {
            const id = Number(tid);
            if (Number.isFinite(id) && file) {
              map.set(id, `${THUMBNAIL_BASE}${file}`);
            }
          });
        }
      } catch (e) {
        // サムネなしで継続（CORS等で読めない場合もここに来る）
        console.warn('[Animel] thumbnails.json の取得に失敗しました', e);
      }
      return map;
    })();
  }
  return cache;
};

// APIが thumbnail を返した場合はそちら優先、なければJSONの対応表を見る。
export const resolveThumbnailUrl = (
  review: { tid: number; thumbnail?: string },
  thumbnails: ThumbnailMap
): string | undefined => {
  return review.thumbnail ?? thumbnails.get(review.tid);
};
