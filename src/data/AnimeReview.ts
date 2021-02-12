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
  rank: Rank
}

export interface Rank {
  id: number,
  rank: number,
  name: string,
  color: string
}
