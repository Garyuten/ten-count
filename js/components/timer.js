/**
 * timer.js
 *
 * Timerモジュールの初期化:
 * - TimerUIとTimerControllerのインスタンス生成
 * - ボタンのクリックイベント設定
 * - ランキング初期表示
 */
/**
 * Timer module initializer
 */
import { TimerUI } from "./TimerUI.js";
import { TimerController } from "./TimerController.js";
import { RankingStorage } from "./storage.js";
import { showRanking } from "./ranking.js";

export function initTimer() {
  const timerElement = document.getElementById("timer");
  const actionBtn = document.getElementById("actionBtn");
  const resultElement = document.getElementById("result");
  const regSection = document.getElementById("ranking-registration");
  const rankingForm = document.getElementById("ranking-form");
  const rankingNameInput = document.getElementById("ranking-name");
  const submitButton = rankingForm?.querySelector('button[type="submit"]');

  const ui = new TimerUI({ timerElement, actionBtn, resultElement, regSection, submitButton, rankingNameInput });
  const controller = new TimerController(ui);

  actionBtn.addEventListener("click", async () => {
    if (actionBtn.dataset.action === "retry") {
      controller.lastRankInId = null;
      await showRanking();
    }
    if (actionBtn.dataset.action === "start" || actionBtn.dataset.action === "retry") {
      controller.startTimer();
    } else if (actionBtn.dataset.action === "stop") {
      controller.stopTimer();
    }
  });

  RankingStorage.initialize();
  (async () => {
    await showRanking();
  })();
}
