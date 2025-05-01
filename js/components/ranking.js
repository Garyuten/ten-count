import { RankingStorage } from './storage.js';

export function renderRanking(container, lastRankInId = null) {
  const records = RankingStorage.getAll()
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 10); // 差分が小さい順に上位10件のみを表示

  let html = '<h2>ローカルランキング</h2>';
  if (records.length === 0) {
    html += '<p>まだ記録がありません。</p>';
  } else {
    html += '<ol class="ranking-list">';
    records.forEach((item, i) => {
      // 名前は全角6文字以内、改行禁止
      const name = String(item.name || "あなた").slice(0, 6);

      let rankLabel = "";
      const rankNumber = i + 1;
      if (i === 0) {
      rankLabel = `<span class="rank rank-1" aria-label="1位"><span class="crown" aria-hidden="true">👑</span><i>1</i></span>`;
      } else if (i === 1) {
      rankLabel = `<span class="rank rank-2" aria-label="2位"><span class="medal">🥈</span><i>2</i></span>`;
      } else if (i === 2) {
      rankLabel = `<span class="rank rank-3" aria-label="3位"><span class="medal">🥉</span><i>3</i></span>`;
      } else {
      rankLabel = `<span class="rank rank-other" aria-label="${rankNumber}位">${rankNumber}</span>`;
      }

      let rankItemClass = "";
      if (i === 0) {
        rankItemClass = "ranking-item-1";
      } else if (i === 1) {
        rankItemClass = "ranking-item-2";
      } else if (i === 2) {
        rankItemClass = "ranking-item-3";
      }
      
      // ランクインした行にrank-inクラスを付与（ID一致時のみ）
      const rankInClass = (lastRankInId && item.id === lastRankInId) ? "rank-in" : "";
      if (rankInClass) {
        console.log(`[diagnosis] ランクイン行: index=${i}, name=${name}, date=${item.date}, id=${item.id}`);
      }
      html += `<li class="ranking-item ${rankItemClass} ${rankInClass}">
      ${rankLabel}
      <span class="time">${item.time.toFixed(2)}</span>
      <span class="diff">(誤差
        <span class="score">${item.diff.toFixed(2)}</span>
        <span class="unit">秒</span>)
      </span>
      <span class="name nowrap">${name}</span>
      <span class="date">${item.date.slice(0, 10)}</span>
      </li>`;
    });
    html += '</ol>';
  }
  container.innerHTML = html;
}