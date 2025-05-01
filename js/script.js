import { RankingStorage } from './components/storage.js';
import { renderRanking } from './components/ranking.js';

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
    timerElement.classList.remove('fade-out');
    actionBtn.textContent = 'スタート';
    resultElement.textContent = '';
}

function updateTimer() {
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

function calculateScore(time) {
    const target = 10;
    const difference = Math.abs(time - target);
    // 差が小さいほど高得点（最大100点）
    const score = Math.max(0, Math.floor(100 - (difference * 20)));
    return score;
}

function showRanking() {
    const rankingContainer = document.getElementById('ranking');
    renderRanking(rankingContainer);
}

actionBtn.addEventListener('click', () => {
    if (actionBtn.textContent === 'スタート') {
        // 既存のタイマーをすべてクリア
        resetTimers();
        
        // ゲーム開始
        startTime = Date.now();
        isRunning = true;
        timerInterval = setInterval(updateTimer, 10);
        actionBtn.textContent = 'ココ！';
        resultElement.textContent = '';
        timerElement.classList.remove('fade-out');

        // 3秒後にカウントをフェードアウト
        fadeTimeout = setTimeout(() => {
            timerElement.classList.add('fade-out');
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
                actionBtn.textContent = 'もう一度';
                
                resultElement.innerHTML = `<div>スコア：<span class="score">${score}</span><span style="font-size: 1.5rem;">点</span></div>`;
            }
        }, 15000);

    } else if (actionBtn.textContent === 'ココ！') {
        // 時間を止める
        if (!isRunning) return;
        
        clearInterval(timerInterval);
        clearTimeout(fadeTimeout);
        isRunning = false;
        
        const finalTime = (Date.now() - startTime) / 1000;
        const score = calculateScore(finalTime);
        
        timerElement.classList.remove('fade-out');
        actionBtn.textContent = 'もう一度';
        
        resultElement.innerHTML = `<div>スコア：<span class="score">${score}</span><span style="font-size: 1.5rem;">点</span></div>`;
        if (Math.abs(finalTime - 10) < 0.1) {
            resultElement.innerHTML += '<div class="perfect">すごい！ピッタリ！</div>';
        }
        // スコア保存＆ランキング表示
        RankingStorage.saveScore(score);
        showRanking();

    } else {
        // リトライ
        resetTimers();
        showRanking();
    }
});

// 初回表示時にもランキングを表示
showRanking();