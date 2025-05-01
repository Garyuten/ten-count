import { RankingStorage } from './components/storage.js';
import { renderRanking } from './components/ranking.js';

// 直近ランクインしたIDを保持
let lastRankInId = null;
let startTime;
let timerInterval;
let fadeTimeout;
let forceStopTimeout;
let isRunning = false;

const timerElement = document.getElementById('timer');
const actionBtn = document.getElementById('actionBtn');
const resultElement = document.getElementById('result');

function resetTimers() {
    // すべてのタイマーをクリア
    clearInterval(timerInterval);
    clearTimeout(fadeTimeout);
    clearTimeout(forceStopTimeout);
    
    // 変数をリセット
    timerInterval = null;
    fadeTimeout = null;
    forceStopTimeout = null;
    isRunning = false;
    
    // 表示をリセット
    timerElement.innerHTML = `
        <div>0</div>
        <div>0</div>
        <div class="dot">.</div>
        <div>0</div>
        <div>0</div>
    `;
    timerElement.style.display = '';
    timerElement.classList.remove('fade-out');
    actionBtn.textContent = 'スタート';
    resultElement.textContent = '';
}

function updateTimer() {
    // DOMが空なら何もしない（フェードアウト後の隠匿対応）
    if (!timerElement.innerHTML) return;
    const currentTime = (Date.now() - startTime) / 1000;
    const timeStr = currentTime.toFixed(2);
    const [whole, decimal] = timeStr.split('.');
    
    // 整数部と小数部を分けて表示
    timerElement.innerHTML = `
        <div>${whole.padStart(2, '0')[0]}</div>
        <div>${whole.padStart(2, '0')[1]}</div>
        <div class="dot">.</div>
        <div>${decimal[0]}</div>
        <div>${decimal[1]}</div>
    `;
}

function calculateDiff(time) {
    const target = 10;
    return Math.abs(time - target);
}

function showRanking() {
    const rankingContainer = document.getElementById('ranking');
    renderRanking(rankingContainer, lastRankInId);
}

actionBtn.addEventListener('click', () => {
// デバッグ用ログ
console.log('actionBtn.dataset.action:', actionBtn.dataset.action);
console.log('isRunning:', isRunning, 'lastRankInId:', lastRankInId, 'timerInterval:', timerInterval, 'startTime:', startTime);
    if (actionBtn.dataset.action === 'start' || actionBtn.dataset.action === 'retry') {
        // ボタンラベルとaria-labelをHTMLのdata属性から取得して設定
        actionBtn.textContent = actionBtn.dataset.labelStart;
        actionBtn.setAttribute('aria-label', actionBtn.dataset.labelStart);
// ランクイン強調をDOMから確実に消す
const rankingContainer = document.getElementById('ranking');
if (rankingContainer) {
    rankingContainer.querySelectorAll('.rank-in').forEach(el => el.classList.remove('rank-in'));
}
        // 既存のタイマーをすべてクリア
        resetTimers();
        // 「もう一度」時はランクイン表現をリセット
        if (actionBtn.dataset.action === 'retry') {
            console.log('retry分岐に入りました');
            lastRankInId = null;
            showRanking();
        }
        
        // ゲーム開始
        startTime = Date.now();
        isRunning = true;
        timerInterval = setInterval(updateTimer, 10);
        // ボタンラベルとaria-labelをHTMLのdata属性から取得して設定
        actionBtn.textContent = actionBtn.dataset.labelStop;
        actionBtn.setAttribute('aria-label', actionBtn.dataset.labelStop);
        actionBtn.dataset.action = 'stop';
        resultElement.textContent = '';
        timerElement.classList.remove('fade-out');

        // 3秒後にカウントをフェードアウト
        fadeTimeout = setTimeout(() => {
            timerElement.classList.add('fade-out');
            // フェードアウト後、innerHTMLを完全に消す
            setTimeout(() => {
                timerElement.innerHTML = '';
            }, 400); // CSSアニメーションと合わせて調整（fade-outのdurationに合わせる）
        }, 3000);

        // 15秒経過で強制終了
        forceStopTimeout = setTimeout(() => {
            if (isRunning) {
                clearInterval(timerInterval);
                clearTimeout(fadeTimeout);
                isRunning = false;
                
                const finalTime = 15.0;
                const score = 0; // 15秒以上は0点
                
                timerElement.classList.remove('fade-out');
                actionBtn.textContent = actionBtn.dataset.labelRetry;
                actionBtn.setAttribute('aria-label', actionBtn.dataset.labelRetry);
                actionBtn.dataset.action = 'retry';
                resultElement.innerHTML = `<div>スコア：<span class="score">${score}</span><span style="font-size: 1.5rem;">点</span></div>`;
            }
        }, 15000);

    } else if (actionBtn.dataset.action === 'stop') {
        // 時間を止める
        if (!isRunning) return;
        
        clearInterval(timerInterval);
        clearTimeout(fadeTimeout);
        isRunning = false;
        
        const finalTime = (Date.now() - startTime) / 1000;
        const diff = calculateDiff(finalTime);

        // カウントを再描画
        const timeStr = finalTime.toFixed(2);
        const [whole, decimal] = timeStr.split('.');
        timerElement.innerHTML = `
            <div>${whole.padStart(2, '0')[0]}</div>
            <div>${whole.padStart(2, '0')[1]}</div>
            <div class="dot">.</div>
            <div>${decimal[0]}</div>
            <div>${decimal[1]}</div>
        `;
        timerElement.classList.remove('fade-out');
        timerElement.style.display = '';
        actionBtn.textContent = actionBtn.dataset.labelRetry;
        actionBtn.setAttribute('aria-label', actionBtn.dataset.labelRetry);
        actionBtn.dataset.action = 'retry';

        resultElement.innerHTML = `<div>誤差：<span class="score">${diff.toFixed(2)}</span><span style="font-size: 1.2rem;">秒</span></div>`;
        if (diff < 0.1) {
            resultElement.innerHTML += '<div class="perfect">すごい！ピッタリ！</div>';
        }
        // 記録保存＆ランキング表示
        const dateStr = new Date().toISOString();
        RankingStorage.saveScore({
            time: finalTime,
            diff: diff,
            date: dateStr,
            name: "あなた"
        });
        lastRankInId = `${dateStr}_あなた_${finalTime}`;
        showRanking();

    } else {
        // リトライ
        resetTimers();
        lastRankInId = null; // リトライ時はハイライト解除
        showRanking();
    }
});

// 初期化処理（既存のランキングデータを10件に制限）
RankingStorage.initialize();

// 初回表示時にもランキングを表示
lastRankInId = null; // 初回表示時はハイライトなし
showRanking();