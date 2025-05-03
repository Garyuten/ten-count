/**
 * ranking.js
 *
 * Supabaseとの連携およびランキング管理モジュール
 * - Supabaseクライアントの初期化
 * - グローバルランキング取得・送信
 * - ランキング描画
 */
import { RankingStorage } from './storage.js';

// Supabaseクライアントの初期化
let supabase = null;
/**
 * setSupabaseClient
 *
 * Supabaseクライアントを初期化します。
 * @param {string} url - SupabaseのURL
 * @param {string} key - SupabaseのAPIキー
 */
export function setSupabaseClient(url, key) {
  if (window.supabase && window.supabase.createClient) {
    supabase = window.supabase.createClient(url, key);
  } else {
    throw new Error('Supabaseライブラリが読み込まれていません');
  }
}
/**
 * initSupabase
 *
 * 環境変数からSupabaseクライアントを初期化します。
 */
export function initSupabase() {
  if (window.SUPABASE_URL && window.SUPABASE_KEY) {
    setSupabaseClient(window.SUPABASE_URL, window.SUPABASE_KEY);
  } else {
    console.warn("SupabaseのURLまたはAPIキーが設定されていません");
  }
}

/**
 * getSupabase
 *
 * 初期化済みのSupabaseクライアントを取得します。
 * @throws {Error} クライアントが初期化されていない場合に例外を投げます。
 */
function getSupabase() {
  if (!supabase) throw new Error('Supabaseクライアントが初期化されていません');
  return supabase;
}

/**
 * グローバルランキング（Supabase）から上位10件を取得
 * @returns {Promise<Array>} [{ name, diff, time, diff, date, id }, ...]
 */
/**
 * グローバルランキング（Supabase）から上位10件を取得
 * @param {"daily"|"weekly"|null} mode - "daily"で日別, "weekly"で週別, nullで全期間
 * @returns {Promise<Array>} [{ name, diff, time, diff, date, id }, ...]
 */
export async function fetchGlobalRanking(mode = null) {
  const supabase = getSupabase();
  console.log(`[Supabase] rankingsテーブルへアクセス開始 (mode: ${mode || 'all'})`);
  
  let query = supabase
    .from('rankings')
    .select('*');
  
  if (mode === 'daily') {
    // 今日の日付のデータのみ取得
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
    console.log(`[Supabase] 日別モード: ${start.toISOString()} から ${end.toISOString()} までのデータを取得`);
  } else if (mode === 'weekly') {
    // 今週のデータのみ取得（日曜日から土曜日）
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0:日曜日, 1:月曜日, ..., 6:土曜日
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek); // 今週の日曜日
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // 今週の土曜日
    endDate.setHours(23, 59, 59, 999);
    
    query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
    console.log(`[Supabase] 週別モード: ${startDate.toISOString()} から ${endDate.toISOString()} までのデータを取得`);
  }
  
  // 最終的に誤差の小さい順に10件取得
  const { data, error } = await query
    .order('diff', { ascending: true })
    .limit(10);

  console.log('[Supabase] 取得結果:', { data, error });

  if (error) {
    console.error('グローバルランキング取得エラー:', error);
    return [];
  }
  if (!data || data.length === 0) {
    console.warn('[Supabase] データが空です');
  } else {
    console.table(data);
  }
  return data.map(item => ({
    id: item.id,
    name: item.name,
    diff: item.diff,
    time: item.time,
    date: item.created_at || item.date
  }));
}

/**
 * グローバルランキング（Supabase）にスコアを登録
 * @param {Object} record - { name, diff, time, diff, date }
 * @returns {Promise<boolean>} 成功時true、失敗時false
 */
export async function submitGlobalRanking(record) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('rankings')
    .insert([{
      name: record.name,
      diff: record.diff,
      time: record.time,
      created_at: record.date || new Date().toISOString()
    }]);
  if (error) {
    console.error('グローバルランキング登録エラー:', error);
    return false;
  }
  return true;
}

/**
 * renderRanking
 *
 * ローカルランキング（あなた）を指定した要素に表示します。
 * @param {HTMLElement} container - ランキング表示用コンテナ要素
 * @param {string|null} lastRankInId - ランクインした最新レコードID（ハイライト用）
 */
export function renderRanking(container, lastRankInId = null) {
  const records = RankingStorage.getAll()
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 10); // 差分が小さい順に上位10件のみを表示

  let html = '<h3>あなた</h3>';
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
        <span class="diff">${item.diff.toFixed(2)}</span>
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
/**
 * @param {"daily"|"weekly"} mode - "daily"で日別, "weekly"で週別
 * @returns {Promise<Array>} [{ score, date }]
 */
export async function renderGlobalRanking(container, mode) {
  if (!container) {
    console.error(
      `[renderGlobalRanking] ${mode}ランキング表示用の要素が見つかりません`
    );
    return;
  }
  container.innerHTML = `<p>ランキング（${
    mode === "daily" ? "日別" : "週別"
  }）取得中...</p>`;
  try {
    console.log(`[renderGlobalRanking] ${mode}ランキングの取得開始`);
    const globalRecords = await fetchGlobalRanking(mode);
    console.log(
      `[renderGlobalRanking] ${mode}ランキングの取得結果:`,
      globalRecords
    );

    let html = `<h3>（${mode === "daily" ? "日別" : "週別"}）</h3>`;
    if (globalRecords.length === 0) {
      html += "<p>まだ記録がありません。</p>";
    } else {
      html += '<ol class="ranking-list">';
      globalRecords.forEach((item, i) => {
        const name = String(item.name || "名無し").slice(0, 6);
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
        html += `<li class="ranking-item ${rankItemClass}">
                  ${rankLabel}
                  <span class="time">${item.time.toFixed(2)}</span>
                  <span class="diff">(誤差
                    <span class="score">${item.diff.toFixed(2)}</span>
                    <span class="unit">秒</span>)
                  </span>
                  <span class="name nowrap">${name}</span>
                  <span class="date">${
                    item.date ? item.date.slice(0, 10) : ""
                  }</span>
                </li>`;
      });
      html += "</ol>";
    }
    container.innerHTML = html;
    console.log(`[renderGlobalRanking] ${mode}ランキングの表示完了`);
  } catch (e) {
    console.error(`[renderGlobalRanking] ${mode}ランキング表示エラー:`, e);
    container.innerHTML = `
            <p>ランキング（${
              mode === "daily" ? "日別" : "週別"
            }）の取得に失敗しました。</p>
            <p>エラー詳細: ${e.message || "Unknown error"}</p>
        `;
  }
}

export async function showRanking(lastRankInId = null) {
  const rankingContainer = document.getElementById("my-ranking");
  renderRanking(rankingContainer, lastRankInId);

  try {
    console.log("[ランキング] 週別ランキングの取得を開始");
    const weeklyContainer = document.getElementById("weekly-ranking");
    await renderGlobalRanking(weeklyContainer, "weekly");
  } catch (error) {
    console.error("[ランキング] 週別ランキング取得エラー:", error);
  }

  try {
    console.log("[ランキング] 日別ランキングの取得を開始");
    const dailyContainer = document.getElementById("daily-ranking");
    await renderGlobalRanking(dailyContainer, "daily");
  } catch (error) {
    console.error("[ランキング] 日別ランキング取得エラー:", error);
  }
}

async function fetchRankingByMode(mode = "daily") {
  const res = await fetch('data/rankings.json');
  const data = await res.json();

  if (mode === "daily") {
    // 日付ごとに最大スコア
    const dailyMap = {};
    data.forEach(item => {
      const day = item.date.slice(0, 10); // YYYY-MM-DD
      if (!dailyMap[day] || item.score > dailyMap[day].score) {
        dailyMap[day] = item;
      }
    });
    return Object.values(dailyMap).sort((a, b) => b.score - a.score);
  } else if (mode === "weekly") {
    // 週ごとに最大スコア（ISO週番号）
    const weeklyMap = {};
    data.forEach(item => {
      const d = new Date(item.date);
      // ISO週番号取得
      const year = d.getFullYear();
      const firstDay = new Date(d.getFullYear(), 0, 1);
      const days = Math.floor((d - firstDay) / 86400000);
      const week = Math.ceil((days + firstDay.getDay() + 1) / 7);
      const key = `${year}-W${week}`;
      if (!weeklyMap[key] || item.score > weeklyMap[key].score) {
        weeklyMap[key] = item;
      }
    });
    return Object.values(weeklyMap).sort((a, b) => b.score - a.score);
  } else {
    throw new Error("modeは 'daily' または 'weekly' を指定してください");
  }
}

export { fetchRankingByMode };