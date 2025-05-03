/**
 * form.js
 *
 * フォーム初期化・送信処理モジュール
 */
import { RankingStorage } from "./storage.js";
import { submitGlobalRanking, showRanking } from "./ranking.js";
import { clearRecordHighlight, highlightRecord } from "./animation.js";
import { switchTab } from "./ui.js";
import { CONFIG } from "../config.js";

const rankingForm = document.getElementById("ranking-form");
const rankingNameInput = document.getElementById("ranking-name");
const submitButton = rankingForm ? rankingForm.querySelector('button[type="submit"]') : null;
const regSection = document.getElementById("ranking-registration");
const formMessage = document.getElementById("form-message");

 // フォームメッセージを非表示にする
function hideFormMessage() {
  if (!formMessage) return;
  formMessage.textContent = "";
  formMessage.classList.add("hidden");
  formMessage.classList.remove("error", "success");
}

 // フォームメッセージを表示（タイプ：error or success）
function showFormMessage(type, text) {
  if (!formMessage) return;
  formMessage.textContent = text;
  formMessage.classList.remove("hidden", "error", "success");
  formMessage.classList.add(type);
}

 // エラーメッセージを表示
function showError(text) {
  showFormMessage("error", "❌ " + text);
}

 // 成功メッセージを表示し設定値（SUCCESS_MESSAGE_DELAY）後に消去
function showSuccess(text) {
 showFormMessage("success", "✅ " + text);
 setTimeout(hideFormMessage, CONFIG.SUCCESS_MESSAGE_DELAY);
}

/**
 * initForm
 *
 * フォームの初期化処理
 */
export function initForm() {
  document.addEventListener("DOMContentLoaded", () => {
    const lastName = localStorage.getItem("lastRankingName");
    if (lastName && rankingNameInput) rankingNameInput.value = lastName;
  });
  // フォーム送信処理を設定
  if (rankingForm) {
    rankingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideFormMessage();
      const name = rankingNameInput.value.trim();
            let len = 0;
            for (const ch of name) {
              len += ch.match(/[^\x00-\x7F]/) ? CONFIG.FULL_WIDTH_WEIGHT : CONFIG.HALF_WIDTH_WEIGHT;
            }
            if (len > CONFIG.MAX_NAME_LENGTH) {
              showError(`名前は全角${CONFIG.MAX_FULL_WIDTH_CHARS}文字（半角${CONFIG.MAX_HALF_WIDTH_CHARS}文字）以内で入力してください。`);
              return;
            }
      const bestRecord = RankingStorage.getBestRecord();
      if (!bestRecord) {
        showError("送信する記録がありません。");
        return;
      }
      const recordData = {
        name: name || bestRecord.name,
        time: bestRecord.time,
        diff: bestRecord.diff,
        date: bestRecord.date,
      };
      const success = await submitGlobalRanking(recordData);
      if (!success) {
        showError("送信に失敗しました。");
        return;
      }
      localStorage.setItem("lastRankingName", name);
      localStorage.setItem("rankingSubmitted", "true");
      showSuccess("送信しました。");
      await showRanking();
      switchTab("daily");
      clearRecordHighlight();
      highlightRecord(recordData);
      if (submitButton) submitButton.disabled = true;
      if (rankingNameInput) rankingNameInput.disabled = true;
      if (regSection) regSection.classList.add("hidden");
    });
  }
  if (rankingNameInput) {
    rankingNameInput.addEventListener("input", hideFormMessage);
  }
}