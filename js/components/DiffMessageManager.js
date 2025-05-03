/**
 * DiffMessageManager.js
 *
 * 誤差に応じたメッセージを提供するモジュール
 * - diff値に基づいてコメントを取得
 */
export class DiffMessageManager {
  /**
   * 指定した誤差(diff)に対応するコメントを取得する
   * @param {number} diff - 誤差（秒）
   * @returns {string} コメントメッセージ
   */
  static getMessage(diff) {
    if (diff < 0.001) {
      return '⏰️…あなたが時の神か…🙏';
    } else if (diff < 0.05) {
      return '惜しい！！！🎉';
    } else if (diff < 0.1) {
      return 'すごい！ほぼピッタリ！👏👏👏';
    } else if (diff < 0.5) {
      return 'いいねいいね！👍️👍️👍️';
    } else if (diff < 1.0) {
      return 'いい感じ！👍️';
    } else if (diff < 2.0) {
      return '😁まあまあかな？😁';
    }
    return '';
  }
}