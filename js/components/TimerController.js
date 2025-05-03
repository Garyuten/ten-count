/**
 * TimerController.js
 *
 * タイマー制御モジュール
 * - startTimer: タイマー開始, フェードアウト/強制終了タイマー設定
 * - stopTimerForced: 強制停止処理 (0点表示, 登録部表示)
 * - stopTimer: 停止処理 (誤差計算, 結果表示, 記録保存, ランキング更新)
 * - updateTimer: タイマー表示更新
 * - resetTimer: リセット処理
 */
import { DiffMessageManager } from "./DiffMessageManager.js";
import { RankingStorage } from "./storage.js";
import { showRanking } from "./ranking.js";
import { CONFIG } from "../config.js";

export class TimerController {
  constructor(ui) {
    this.ui = ui;
    this.isRunning = false;
    this.startTime = null;
    this.timerInterval = null;
    this.fadeTimeout = null;
    this.forceStopTimeout = null;
    this.lastRankInId = null;
  }

    /**
     * startTimer
     *
     * タイマーの開始処理を行います。
     * - UIをリセットし、タイマーをスタート
     * - 3秒後にフェードアウト
     * - 15秒後に強制停止
     */
    startTimer() {
    this.ui.resetDisplay();
    this.startTime = Date.now();
    this.isRunning = true;
    this.timerInterval = setInterval(() => this.updateTimer(), CONFIG.TIMER_INTERVAL);
    this.ui.showStopState(this.ui.actionBtn.dataset.labelStop);

    this.fadeTimeout = setTimeout(() => {
      this.ui.timerElement.classList.add("fade-out");
      setTimeout(() => {
        this.ui.timerElement.innerHTML = "";
      }, CONFIG.FADE_DURATION);
    }, CONFIG.FADE_DELAY);

    this.forceStopTimeout = setTimeout(() => {
      if (this.isRunning) {
        this.stopTimerForced();
      }
    }, CONFIG.FORCE_STOP_DELAY);
  }

    /**
     * stopTimerForced
     *
     * 強制停止処理（15秒経過後に呼び出し）:
     * - タイマー停止
     * - 0点として表示
     * - ランキング登録セクションを表示
     */
    stopTimerForced() {
    clearInterval(this.timerInterval);
    clearTimeout(this.fadeTimeout);
    this.isRunning = false;
    const finalTime = CONFIG.FINAL_TIME_MAX;
    const diff = Math.abs(finalTime - CONFIG.TARGET_TIME);
    this.ui.updateTimerDisplay(finalTime);
    this.ui.timerElement.classList.remove("fade-out");
    this.ui.timerElement.style.display = "";
    this.ui.showRetryState(this.ui.actionBtn.dataset.labelRetry);
    this.ui.showResult(diff);
    this.ui.showRankingRegistration();
  }

    /**
     * stopTimer
     *
     * ユーザーが停止ボタンを押したときの処理:
     * - タイマー停止
     * - 誤差(diff)計算および結果表示
     * - スコア保存、ランキング更新
     * - ランキング登録部の表示
     */
    stopTimer() {
    if (!this.isRunning) return;
    clearInterval(this.timerInterval);
    clearTimeout(this.fadeTimeout);
    this.isRunning = false;
    const finalTime = (Date.now() - this.startTime) / 1000;
    const diff = Math.abs(finalTime - CONFIG.TARGET_TIME);
    this.ui.updateTimerDisplay(finalTime);
    this.ui.timerElement.classList.remove("fade-out");
    this.ui.timerElement.style.display = "";
    this.ui.showRetryState(this.ui.actionBtn.dataset.labelRetry);
    this.ui.showResult(diff);

    const dateStr = new Date().toISOString();
    RankingStorage.saveScore({
      time: finalTime,
      diff,
      date: dateStr,
      name: "あなた",
    });
    this.lastRankInId = `${dateStr}_あなた_${finalTime}`;
    showRanking();
    this.ui.showRankingRegistration();
  }

    /**
     * updateTimer
     *
     * タイマーの経過時間を取得し、UIを更新します
     */
    updateTimer() {
    if (!this.ui.timerElement.innerHTML) return;
    const currentTime = (Date.now() - this.startTime) / 1000;
    this.ui.updateTimerDisplay(currentTime);
  }

    /**
     * resetTimer
     *
     * タイマーをリセット:
     * - タイマー停止
     * - UIを初期表示状態に戻す
     */
    resetTimer() {
    clearInterval(this.timerInterval);
    clearTimeout(this.fadeTimeout);
    clearTimeout(this.forceStopTimeout);
    this.isRunning = false;
    this.ui.resetDisplay();
  }
}