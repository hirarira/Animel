import axios, { AxiosInstance } from 'axios';

export class GetAnimeReview {
  host: string;
  instance: AxiosInstance;
  constructor() {
    this.host = 'https://pollux.hirarira.net/';
    this.instance = axios.create({
      baseURL: this.host,
      responseType: 'json'
    });
  }

  /**
   * 特定の視聴月にマッチするアニメを取得する
   * @param season
   * @returns
   */
  async getWatchDate(season: string) {
    const path = `/showMinogashiAnime/api/getWatchDate/${season}`;
    const response = await this.instance.get(path);
    if(response.status !== 200) {
      throw new Error('Response Status is '+response.status);
    }
    return response.data.body;
  }

  /**
   * 特定の評価にマッチするアニメを取得する
   * @param high
   * @param low
   * @returns
   */
  async getWatchRate(high: number, low: number) {
    const path = `/showMinogashiAnime/api/getRoundRate/${high}/${low}`;
    const response = await this.instance.get(path);
    if(response.status !== 200) {
      throw new Error('Response Status is '+response.status);
    }
    return response.data.body;
  }

  /**
   * タイトル部分一致でアニメを検索する
   * @param query 検索文字列（2文字以上）
   */
  async searchAnime(query: string) {
    const path = `/showMinogashiAnime/api/searchAnime/${encodeURIComponent(query)}`;
    const response = await this.instance.get(path);
    if(response.status !== 200) {
      throw new Error('Response Status is '+response.status);
    }
    if(response.data.status !== 'ok') {
      // サーバー側のバリデーションエラー（2文字未満など）はそのまま伝える
      throw new Error(response.data.body);
    }
    return response.data.body;
  }

  /**
   * 全てのアニメを取得する
   */
  async getAll() {
    const path = `/showMinogashiAnime/api/getAllAnimeReview`;
    const response = await this.instance.get(path);
    if(response.status !== 200) {
      throw new Error('Response Status is '+response.status);
    }
    return response.data.body;
  }

}
