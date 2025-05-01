// スコア保存・取得・統計管理用モジュール
const STORAGE_KEY = 'tenCountRankings';

export const RankingStorage = {
  // スコアを保存（新しいスコアを追加）
  saveScore(score) {
    const data = this.getAll();
    data.unshift({ score, date: new Date().toISOString() });
    // 直近10件のみ保存
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.slice(0, 10)));
  },

  // 全スコア取得
  getAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  // ハイスコア取得
  getHighScore() {
    const data = this.getAll();
    if (data.length === 0) return null;
    return data.reduce((max, cur) => (cur.score > max.score ? cur : max));
  },

  // 平均スコア取得
  getAverage() {
    const data = this.getAll();
    if (data.length === 0) return null;
    const sum = data.reduce((acc, cur) => acc + cur.score, 0);
    return sum / data.length;
  },

  // スコア履歴取得（グラフ用）
  getHistory() {
    return this.getAll();
  },
};
