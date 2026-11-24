/**
 * 「アニメ日」の日付ユーティリティ。
 *
 * 日の境界は SMA の anyAnime ページと同じく 05:00 JST とする
 * （START_DATE = 5 の convention）。深夜 0〜5 時の放送は前日分として扱うため、
 * ユーザーの視聴リズム（深夜アニメ）とも一致する。
 * ラベル日付は「そのアニメ日が始まる暦日」を 'YYYY-MM-DD' で表す。
 */

const JST_OFFSET_MS = 9 * 3600 * 1000;
const DAY_MS = 24 * 3600 * 1000;
const ANIME_DAY_START_HOUR = 5;

/** ラベル日付のアニメ日の開始・終了（Unix ミリ秒）。終了は翌 04:59:59（BETWEEN の両端含み対策） */
export function animeDayRangeMs(label: string): { start: number; end: number } {
  const start = Date.parse(`${label}T05:00:00+09:00`);
  return { start, end: start + DAY_MS - 1000 };
}

/** ラベル日付のアニメ日の範囲を、しょぼいカレンダー API 形式（yyyyMMddHHmm・JST）で返す */
export function animeDayRangeYmdHm(label: string): { start: string; end: string } {
  const ymd = (l: string) => l.replace(/-/g, '');
  return { start: `${ymd(label)}0500`, end: `${ymd(shiftDayLabel(label, 1))}0500` };
}

/** 現在時刻が属するアニメ日のラベル */
export function currentAnimeDayLabel(now: Date = new Date()): string {
  const shifted = new Date(now.getTime() + JST_OFFSET_MS - ANIME_DAY_START_HOUR * 3600 * 1000);
  return shifted.toISOString().slice(0, 10);
}

/** 放送時刻（Unix 秒）が属するアニメ日のラベル */
export function animeDayLabelOf(stTimeSec: number): string {
  const shifted = new Date(stTimeSec * 1000 + JST_OFFSET_MS - ANIME_DAY_START_HOUR * 3600 * 1000);
  return shifted.toISOString().slice(0, 10);
}

/** ラベル日付を n 日ずらす */
export function shiftDayLabel(label: string, days: number): string {
  const d = new Date(Date.parse(`${label}T12:00:00+09:00`) + days * DAY_MS);
  return d.toISOString().slice(0, 10);
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

/** ラベル日付の表示（例: 11月22日（土）） */
export function formatDayLabel(label: string): string {
  const d = new Date(Date.parse(`${label}T12:00:00+09:00`));
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const weekday = WEEKDAYS[d.getUTCDay()];
  return `${month}月${day}日（${weekday}）`;
}

/**
 * 放送時刻の表示。アニメ日の中では 05:00〜28:59 の表記にする
 * （深夜 1:30 は 25:30 と表示する、しょぼいカレンダー式）。
 */
export function formatBroadcastTime(stTimeSec: number): string {
  const jst = new Date(stTimeSec * 1000 + JST_OFFSET_MS);
  let hour = jst.getUTCHours();
  const minute = jst.getUTCMinutes();
  if (hour < ANIME_DAY_START_HOUR) hour += 24;
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

/** 放送日時の表示（週ビュー用。例: 11/16（日） 24:55） */
export function formatBroadcastDateTime(stTimeSec: number): string {
  const label = animeDayLabelOf(stTimeSec);
  const d = new Date(Date.parse(`${label}T12:00:00+09:00`));
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const weekday = WEEKDAYS[d.getUTCDay()];
  return `${month}/${day}（${weekday}） ${formatBroadcastTime(stTimeSec)}`;
}

/** クリップボードへコピー（Clipboard API が使えない環境では textarea 経由でフォールバック） */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}
