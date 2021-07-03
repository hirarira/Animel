const axios = require('axios');

export class GetAnimeReview {
  host: string;
  instance: any;
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

