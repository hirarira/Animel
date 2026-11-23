import axios, { AxiosInstance } from 'axios';
import { AnimeStoryList } from './AnimeStory';

/** 認証エラー（401）を判別するためのエラー */
export class UnauthorizedError extends Error {
  constructor() {
    super('unauthorized');
    this.name = 'UnauthorizedError';
  }
}

function isUnauthorized(e: unknown): boolean {
  return axios.isAxiosError(e) && e.response?.status === 401;
}

/**
 * 既読管理（話数リスト）用 API。
 * 読み取りは公開、書き込みはセッショントークン（Bearer）が必須。
 */
export class GetAnimeStory {
  host: string;
  instance: AxiosInstance;
  constructor() {
    this.host = 'https://pollux.hirarira.net/';
    this.instance = axios.create({
      baseURL: this.host,
      responseType: 'json',
    });
  }

  /** アニメの全話数情報を取得（公開読み取り） */
  async getStoryList(tid: string | number): Promise<AnimeStoryList> {
    const path = `/showMinogashiAnime/api/getAnimeStoryList/${tid}`;
    const response = await this.instance.get(path);
    if (response.status !== 200) {
      throw new Error('Response Status is ' + response.status);
    }
    return response.data.body as AnimeStoryList;
  }

  /**
   * 話数の見逃しフラグとコメントを保存する（要 Bearer 認証）。
   * setAnimeStory は minogashi と comment の両方を上書きするので、常に両方送る。
   */
  async setAnimeStory(
    token: string,
    options: { tid: number; count: number; minogashi: number; comment: string }
  ): Promise<void> {
    const path = `/showMinogashiAnime/api/setAnimeStory`;
    try {
      const response = await this.instance.post(path, options, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status !== 'ok') {
        throw new Error('setAnimeStory failed: ' + JSON.stringify(response.data));
      }
    } catch (e) {
      if (isUnauthorized(e)) throw new UnauthorizedError();
      throw e;
    }
  }

  /**
   * 未登録の話数をしょぼいカレンダーから取得して登録する（要 Bearer 認証）。
   * レスポンスは {status, comment, regStories, date} 形式（body ラップなし）。
   */
  async getNoRegistStories(token: string, tid: string | number): Promise<{ status: string; comment: string }> {
    const path = `/showMinogashiAnime/api/getNoRegistStories/${tid}`;
    try {
      const response = await this.instance.post(path, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data as { status: string; comment: string };
    } catch (e) {
      if (isUnauthorized(e)) throw new UnauthorizedError();
      throw e;
    }
  }
}
