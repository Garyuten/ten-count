/**
 * animation.js
 *
 * ランクイン演出を管理するモジュール
 */
/**
 * ランクイン演出処理モジュール
 */

/**
 * 指定したレコードに対して、ランクイン演出（.rank-inクラス付与）を行います。
 * @param {{time:number,diff:number,name:string}} record
 * @param {Array<string>} periods - 対象期間（例: ['daily','weekly']）
 */
export function highlightRecord(record, periods = ['weekly', 'daily']) {
  if (!record) return;
  periods.forEach((period) => {
    const container = document.getElementById(`${period}-ranking`);
    if (!container) return;
    container.querySelectorAll('.ranking-item').forEach((li) => {
      const timeEl = li.querySelector('.time');
      const diffEl = li.querySelector('.score');
      const nameEl = li.querySelector('.name');
      if (!timeEl || !diffEl || !nameEl) return;
      const timeVal = parseFloat(timeEl.textContent);
      const diffVal = parseFloat(diffEl.textContent);
      const nameVal = nameEl.textContent.trim();
      if (
        timeVal === record.time &&
        diffVal === record.diff &&
        nameVal === String(record.name).slice(0, 6)
      ) {
        li.classList.add('rank-in');
      }
    });
  });
}

/**
 * 演出で付与された .rank-in クラスを全て除去します。
 */
export function clearRecordHighlight() {
  document.querySelectorAll('.rank-in').forEach((el) => {
    el.classList.remove('rank-in');
  });
}