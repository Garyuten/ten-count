// config.js

const DEFAULT_CONFIG = {
  // ターゲットとする制限時間（秒）
  TARGET_TIME: 10,
  // プレイヤー名の最大長
  MAX_NAME_LENGTH: 20,
  // 全角文字の最大入力数
  MAX_FULL_WIDTH_CHARS: 10,
  // 半角文字の最大入力数
  MAX_HALF_WIDTH_CHARS: 20,
  // 最終タイムの最大値（秒）
  FINAL_TIME_MAX: 15.0,
  // 強制停止までの遅延（ミリ秒）
  FORCE_STOP_DELAY: 15000,
  // フェードアウト開始までの遅延（ミリ秒）
  FADE_DELAY: 3000,
  // フェードアウト継続時間（ミリ秒）
  FADE_DURATION: 400,
  // タイマー更新間隔（ミリ秒）
  TIMER_INTERVAL: 10,
  // オーバーフロー時のスコア
  SCORE_FOR_OVERFLOW: 0,
  // 全角文字のスコア重み
  FULL_WIDTH_WEIGHT: 2,
  // 半角文字のスコア重み
  HALF_WIDTH_WEIGHT: 1,
  // 成功メッセージ表示時間（ミリ秒）
  SUCCESS_MESSAGE_DELAY: 3000
};

const CONFIG = window.APP_CONFIG || DEFAULT_CONFIG;

export { CONFIG };