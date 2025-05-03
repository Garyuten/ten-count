/**
 * ui.js
 *
 * UI操作モジュール:
 * - タブ切り替え (switchTab)
 * - タブとコンテンツの初期化 (initTabs)
 */

/**
 * switchTab
 *
 * 指定されたperiodに基づき、タブボタンとタブコンテンツの表示を切り替えます。
 * @param {"you"|"daily"|"weekly"} period - 表示するランキングの期間
 */
export function switchTab(period) {
  const tabButtons = document.querySelectorAll(".ranking-tabs button");
  const tabContents = document.querySelectorAll(".tab-content");
  tabButtons.forEach((b) => b.classList.remove("current"));
  const btn = document.querySelector(`.ranking-tabs button[data-period="${period}"]`);
  if (btn) btn.classList.add("current");
  tabContents.forEach((c) => c.classList.remove("active"));
  let targetId;
  if (period === "you") {
    targetId = "my-ranking";
  } else if (period === "weekly") {
    targetId = "weekly-ranking";
  } else {
    targetId = "daily-ranking";
  }
  const contentEl = document.getElementById(targetId);
  if (contentEl) contentEl.classList.add("active");
}

/**
 * initTabs
 *
 * タブボタンのクリックイベントを設定し、初期表示タブを「あなた」に切り替えます。
 */
export function initTabs() {
  const tabButtons = document.querySelectorAll(".ranking-tabs button");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.period);
    });
  });
  // 初期表示は「あなた」
  switchTab("you");
}