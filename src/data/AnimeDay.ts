/**
 * 日単位ビュー（今日 / 過去1週間の見逃し）で使う話単位のレコード。
 * getAnimeAnyDay / getWeekMinogashiAnime はどちらも
 * animeStory と anime（概要）をマージした形で返す。
 */
export interface DayAnimeItem {
  id: number;
  tid: number;
  /** 話数 */
  count: number;
  subTitle: string | null;
  /** 放送開始（Unix 秒） */
  stTime: number;
  /** 放送終了（Unix 秒） */
  edTime: number;
  lastUpdate: number;
  /** 0: 未視聴, 1: 視聴済み */
  minogashi: number;
  comment: string | null;
  title: string;
  chName: string;
  url: string;
  hashTag: string;
  characterURL: string;
  publicURL: string;
}

/** getAnimeReview/:tid の返すレビュー＋概要のマージ結果 */
export interface AnimeReviewDetail {
  tid: number;
  title: string;
  chName: string;
  url: string;
  hashTag: string;
  characterURL: string;
  publicURL: string;
  /** 視聴時期（例: "2026年秋"。古いデータでは日付形式のこともある） */
  watchDate: string;
  /** 評価（0〜100、特殊値として負数もありうる） */
  rate: number;
  comment: string;
}
