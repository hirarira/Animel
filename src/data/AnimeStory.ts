/** getAnimeStoryList の about（アニメ概要） */
export interface AnimeAbout {
  tid: number;
  title: string;
  chName: string;
  url: string;
  hashTag: string;
  characterURL: string;
  publicURL: string;
}

/** getAnimeStoryList の story（各話情報） */
export interface AnimeStory {
  id: number;
  tid: number;
  count: number;
  /** サブタイトル（未登録なら空文字や null） */
  subTitle: string | null;
  /** 放送開始（Unix 秒） */
  stTime: number;
  /** 放送終了（Unix 秒） */
  edTime: number;
  lastUpdate: number;
  /** 0: 見逃し（未視聴）, 1: 視聴済み */
  minogashi: number;
  comment: string | null;
}

export interface AnimeStoryList {
  about: AnimeAbout;
  story: AnimeStory[];
}
