import { AnimeReview } from "../../data/AnimeReview";

// サムネイルの置き場所（リポジトリ外の静的ディレクトリを参照する）。
// 環境変数 VITE_THUMBNAIL_BASE_URL で差し替え可能。
const THUMBNAIL_BASE = (
  import.meta.env.VITE_THUMBNAIL_BASE_URL
  ?? 'https://pollux.hirarira.net/showMinogashiAnime/thumbs/'
).replace(/\/?$/, '/');

// モック用マッピング（tid → ファイル名）。
// バックエンドが thumbnail を返すようになったら、この仮対応は不要になる。
const mockThumbnailFiles: Record<number, string> = {
  2077: '2077.svg', // 魔法少女まどか☆マギカ
  2142: '2142.svg', // Steins;Gate
  4617: '4617.svg', // メイドインアビス
  4786: '4786.svg', // 宇宙よりも遠い場所
  7382: '7382.svg', // アポカリプスホテル
  7604: '7604.svg', // グノーシア
};

// サムネイルURLを返す。設定されていないアニメでは undefined（＝表示しない）。
export const getThumbnailUrl = (review: AnimeReview): string | undefined => {
  if (review.thumbnail) {
    return review.thumbnail;
  }
  const file = mockThumbnailFiles[review.tid];
  return file ? `${THUMBNAIL_BASE}${file}` : undefined;
};
