import axios, { AxiosInstance } from 'axios';
import { AnimeReviewDetail, DayAnimeItem, StatusAnimeItem, ViewStatus } from './AnimeDay';
import { UnauthorizedError } from './getAnimeStory';

function isUnauthorized(e: unknown): boolean {
  return axios.isAxiosError(e) && e.response?.status === 401;
}

/**
 * 管理画面（日単位ビュー / 週間見逃し / 情報更新）用 API。
 * 読み取りは公開、書き込みは Google ID トークン（Bearer）が必須。
 */
export class GetAnimeDay {
  host: string;
  instance: AxiosInstance;
  constructor() {
    this.host = 'https://pollux.hirarira.net/';
    this.instance = axios.create({
      baseURL: this.host,
      responseType: 'json',
    });
  }

  /** 指定範囲（Unix ミリ秒）に放送される話を DB から取得する */
  async getAnimeAnyDay(startMs: number, endMs: number): Promise<DayAnimeItem[]> {
    const path = `/showMinogashiAnime/api/getAnimeAnyDay/${startMs}/${endMs}`;
    const response = await this.instance.get(path);
    if (response.status !== 200) {
      throw new Error('Response Status is ' + response.status);
    }
    return response.data.body as DayAnimeItem[];
  }

  /** 過去1週間の見逃し（未視聴）一覧を取得する */
  async getWeekMinogashiAnime(): Promise<DayAnimeItem[]> {
    const path = `/showMinogashiAnime/api/getWeekMinogashiAnime`;
    const response = await this.instance.get(path);
    if (response.status !== 200) {
      throw new Error('Response Status is ' + response.status);
    }
    return response.data.body as DayAnimeItem[];
  }

  /**
   * レビュー（評価・コメント・視聴時期）を取得する。
   * レビュー未作成の作品ではサーバーが body: null を返すので、その場合は null。
   */
  async getAnimeReview(tid: string | number): Promise<AnimeReviewDetail | null> {
    const path = `/showMinogashiAnime/api/getAnimeReview/${tid}`;
    const response = await this.instance.get(path);
    if (response.status !== 200) {
      throw new Error('Response Status is ' + response.status);
    }
    if (response.data.status === 'ng') {
      throw new Error(response.data.body);
    }
    return (response.data.body ?? null) as AnimeReviewDetail | null;
  }

  /** レビュー（クール設定・評価・コメント）を保存する（要 Bearer 認証） */
  async setAnimeReview(
    idToken: string,
    options: { tid: number; rate: number; comment: string; watchDate: string }
  ): Promise<void> {
    const path = `/showMinogashiAnime/api/setAnimeReview`;
    try {
      const response = await this.instance.post(path, options, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (response.data.status !== 'ok') {
        throw new Error('setAnimeReview failed: ' + JSON.stringify(response.data));
      }
    } catch (e) {
      if (isUnauthorized(e)) throw new UnauthorizedError();
      throw e;
    }
  }

  /** 指定した視聴ステータスのアニメ一覧を取得する */
  async getAnimeByStatus(status: ViewStatus): Promise<StatusAnimeItem[]> {
    const path = `/showMinogashiAnime/api/getAnimeByStatus/${status}`;
    const response = await this.instance.get(path);
    if (response.status !== 200) {
      throw new Error('Response Status is ' + response.status);
    }
    if (response.data.status !== 'ok') {
      throw new Error(response.data.body);
    }
    return response.data.body as StatusAnimeItem[];
  }

  /** 視聴ステータスを保存する（要 Bearer 認証。レビュー行が無ければ作られる） */
  async setAnimeStatus(
    idToken: string,
    options: { tid: number; status: ViewStatus }
  ): Promise<void> {
    const path = `/showMinogashiAnime/api/setAnimeStatus`;
    try {
      const response = await this.instance.post(path, options, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (response.data.status !== 'ok') {
        throw new Error('setAnimeStatus failed: ' + JSON.stringify(response.data));
      }
    } catch (e) {
      if (isUnauthorized(e)) throw new UnauthorizedError();
      throw e;
    }
  }

  /** 概要（ハッシュタグ・公式サイト・キャラクターページ）を保存する（要 Bearer 認証） */
  async setAnimeAbout(
    idToken: string,
    options: { tid: number; hashTag: string; characterURL: string; publicURL: string }
  ): Promise<void> {
    const path = `/showMinogashiAnime/api/setAnimeAbout`;
    try {
      const response = await this.instance.post(path, options, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (response.data.status !== 'ok') {
        throw new Error('setAnimeAbout failed: ' + JSON.stringify(response.data));
      }
    } catch (e) {
      if (isUnauthorized(e)) throw new UnauthorizedError();
      throw e;
    }
  }
}
