/**
 * storage.js
 *
 * スコア保存・取得・統計管理モジュール
 */
const STORAGE_KEY = 'tenCountRankings';

export const RankingStorage = {
  // 初期化処理（既存データを10件に制限）
  initialize() {
    const data = this.getAll();
    if (data.length > 10) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.slice(0, 10)));
    }
  },
  // スコアを保存（新しいスコアを追加）
  // スコア保存（新しいスコアを追加）
  // params: { time: number, diff: number, date: string, name: string }
  saveScore({ time, diff, date, name }) {
    const data = this.getAll();
    // 一意なIDを生成（date+name+timeで十分ユニーク）
    const id = `${date}_${name}_${time}`;
    data.unshift({ id, time, diff, date, name });
    // 直近10件のみ保存
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.slice(0, 10)));
  },

  // 全スコア取得
  getAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    // 古いデータ(scoreのみ)を新構造に変換
    return arr.map(item => {
      // 既にidがあればそのまま
      if (item.id) return item;
      if (item.time !== undefined && item.diff !== undefined && item.name !== undefined) {
        // idがない場合は生成
        const id = `${item.date}_${item.name}_${item.time}`;
        return { ...item, id };
      }
      // 旧データ(score, date)→新データ(time, diff, date, name, id)
      const time = typeof item.score === "number" ? item.score : 0;
      const diff = Math.abs(time - 10);
      const id = `${item.date}_あなた_${time}`;
      return { id, time, diff, date: item.date, name: "あなた" };
    });
  },

  // ハイスコア取得
  // 最も差分が小さい記録（ベスト記録）を取得
  getBestRecord() {
    const data = this.getAll();
    if (data.length === 0) return null;
    return data.reduce((best, cur) => (cur.diff < best.diff ? cur : best));
  },

  // 平均スコア取得
  // 平均差分
  getAverageDiff() {
    const data = this.getAll();
    if (data.length === 0) return null;
    const sum = data.reduce((acc, cur) => acc + cur.diff, 0);
    return sum / data.length;
  },

  // スコア履歴取得（グラフ用）
  getHistory() {
    return this.getAll();
  },
};
