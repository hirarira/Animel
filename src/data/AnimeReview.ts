export interface AnimeReview {
  tid: number,
  title: string,
  chName: string,
  url: string,
  hashTag: string,
  characterURL: string,
  publicURL: string,
  watchDate: string,
  rate: number,
  comment: string,
  rank: Rank,
  // 偏差値
  deviation: number;
  // サムネイル画像のURL（未設定のアニメでは存在しない）
  thumbnail?: string;
}

export interface Rank {
  id: number,
  rank: number,
  name: string,
  color: string
}
