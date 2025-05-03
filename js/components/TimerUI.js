/**
 * TimerUI.js
 *
 * タイマーのUI操作モジュール
 * - タイマー表示のリセット
 * - タイマー更新表示
 * - 結果表示（誤差・コメント）
 * - ボタン状態切り替え（停止/リトライ）
 * - ランキング登録部表示
 */
import { DiffMessageManager } from "./DiffMessageManager.js";

export class TimerUI {
  constructor({ timerElement, actionBtn, resultElement, regSection, submitButton, rankingNameInput }) {
    this.timerElement = timerElement;
    this.actionBtn = actionBtn;
    this.resultElement = resultElement;
    this.regSection = regSection;
    this.submitButton = submitButton;
    this.rankingNameInput = rankingNameInput;
  }

  resetDisplay() {
    this.timerElement.innerHTML = `
      <div>0</div><div>0</div><div class="dot">.</div><div>0</div><div>0</div>
    `;
    this.timerElement.style.display = "";
    this.timerElement.classList.remove("fade-out");
    this.actionBtn.textContent = this.actionBtn.dataset.labelStart;
    this.actionBtn.setAttribute("aria-label", this.actionBtn.dataset.labelStart);
    this.actionBtn.dataset.action = "start";
    this.resultElement.textContent = "";
    if (!localStorage.getItem("rankingSubmitted")) {
      this.regSection.classList.add("hidden");
      this.regSection.style.display = "none";
    }
  }

  updateTimerDisplay(time) {
    const timeStr = time.toFixed(2);
    const [whole, decimal] = timeStr.split(".");
    this.timerElement.innerHTML = `
      <div>${whole.padStart(2, "0")[0]}</div>
      <div>${whole.padStart(2, "0")[1]}</div>
      <div class="dot">.</div>
      <div>${decimal[0]}</div>
      <div>${decimal[1]}</div>
    `;
  }

  showResult(diff) {
    this.resultElement.innerHTML = `<div>誤差：<span class="score">${diff.toFixed(2)}</span><span style="font-size:1.2rem;">秒</span></div>`;
    const comment = DiffMessageManager.getMessage(diff);
    if (comment) {
      const className = this.getCommentClass(diff);
      this.resultElement.innerHTML += `<div class="comment ${className}">${comment}</div>`;
    }
  }

  getCommentClass(diff) {
    if (diff < 0.001) return "perfect";
    if (diff < 0.05) return "amazing";
    if (diff < 0.1) return "great";
    if (diff < 0.5) return "nice";
    if (diff < 1.0) return "good";
    if (diff < 2.0) return "ok";
    return "";
  }

  showRetryState(labelRetry) {
    this.actionBtn.textContent = labelRetry;
    this.actionBtn.setAttribute("aria-label", labelRetry);
    this.actionBtn.dataset.action = "retry";
  }

  showStopState(labelStop) {
    this.actionBtn.textContent = labelStop;
    this.actionBtn.setAttribute("aria-label", labelStop);
    this.actionBtn.dataset.action = "stop";
  }

  showRankingRegistration() {
    this.regSection.classList.remove("hidden");
    this.regSection.style.display = "block";
    this.submitButton.disabled = false;
    this.rankingNameInput.disabled = false;
  }
}