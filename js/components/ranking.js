import { RankingStorage } from './storage.js';

export function renderRanking(container) {
  const scores = RankingStorage.getAll()
    .sort((a, b) => b.score - a.score);
  const highScore = RankingStorage.getHighScore();
  const average = RankingStorage.getAverage();

  let html = '<h2>ローカルランキング</h2>';
  if (scores.length === 0) {
    html += '<p>まだ記録がありません。</p>';
  } else {
    html += '<ol class="ranking-list">';
    scores.forEach((item, i) => {
      html += `<li><span class="rank">${i + 1}位</span> <span class="score">${item.score.toFixed(2)}<span class="unit">点</span></span> <span class="date">(${item.date.slice(0, 10)})</span></li>`;
    });
    html += '</ol>';
    html += `<div class="ranking-stats">
      <div>ハイスコア: <b>${highScore ? highScore.score.toFixed(2) : '0.00'}</b>点</div>
      <div>平均スコア: <b>${average ? average.toFixed(2) : '0.00'}</b>点</div>
    </div>`;
  }
  container.innerHTML = html;
}