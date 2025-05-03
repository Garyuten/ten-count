/**
 * app.js
 *
 * アプリケーションのエントリポイント。
 * 各コンポーネント（Supabase連携、フォーム、UIタブ、タイマー）の初期化を実行します。
 */
import { initSupabase } from "./components/ranking.js";
import { initForm } from "./components/form.js";
import { initTabs } from "./components/ui.js";
import { initTimer } from "./components/timer.js";

// Supabaseクライアントの初期化
initSupabase();

// ランキング送信用フォームの初期化
initForm();

// タブ切り替え機能の初期化
initTabs();

// タイマー機能の初期化
initTimer();