// 遊戲狀態
let board = [];
let currentPlayer = 1;
let gameOver = false;
let boardSize = 10;
let winLength = 5;
let socket = null;
let currentRoom = null;
let playerId = null;
let playerNumber = 0;

// 初始化遊戲
function initGame() {
    playerId = generatePlayerId();
    createBoard();
    updateStatus();
}

// 生成玩家ID
function generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
}

// 創建房間
function createRoom() {
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    document.getElementById('roomInput').value = roomId;
    joinRoom(roomId, true);
}

// 加入房間
function joinRoom(roomId = null, isCreator = false) {
    const roomInput = document.getElementById('roomInput');
    const roomIdToJoin = roomId || roomInput.value.trim().toUpperCase();
    
    if (!roomIdToJoin) {
        alert('請輸入房間ID');
        return;
    }

    currentRoom = roomIdToJoin;
    
    // 模擬 Socket.io 連接（實際部署時需要真正的後端）
    simulateSocketConnection(roomIdToJoin, isCreator);
    
    document.getElementById('roomStatus').textContent = `房間: ${roomIdToJoin}`;
    document.getElementById('playerInfo').textContent = '連接中...';
}

// 模擬 Socket 連接
function simulateSocketConnection(roomId, isCreator) {
    console.log(`模擬連接房間: ${roomId}, 創建者: ${isCreator}`);
    
    // 模擬連接成功
    setTimeout(() => {
        playerNumber = isCreator ? 1 : 2;
        document.getElementById('playerInfo').textContent = `玩家${playerNumber} (${isCreator ? '房主' : '玩家'})`;
        document.getElementById('status').innerHTML = `<span class="player${currentPlayer}">玩家${currentPlayer}</span>的回合`;
        
        updatePlayersList([
            { id: 'player1', number: 1, name: '玩家1', current: playerNumber === 1 },
            { id: 'player2', number: 2, name: '玩家2', current: playerNumber === 2 }
        ]);
        
        // 模擬對手加入
        if (isCreator) {
            setTimeout(() => {
                document.getElementById('status').innerHTML = `<span class="player1">玩家1</span>的回合 - 輪到你下棋`;
                alert('玩家2 已加入房間！遊戲開始！');
            }, 1000);
        } else {
            document.getElementById('status').innerHTML = `<span class="player1">玩家1</span>的回合 - 等待對手下棋`;
            alert('成功加入房間！等待遊戲開始！');
        }
    }, 500);
}

// 更新玩家列表
function updatePlayersList(players) {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    
    players.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = `player-item ${player.current ? 'current' : ''}`;
        playerItem.innerHTML = `
            <span>${player.name}</span>
            <span>${player.current ? '👤 你' : '🟢 在線'}</span>
        `;
        playersList.appendChild(playerItem);
    });
}

// 創建棋盤
function createBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    
    for (let i = 0; i < boardSize; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            cell.addEventListener('click', () => makeMove(i, j));
            row.appendChild(cell);
        }
        boardElement.appendChild(row);
    }
    
    updateBoard();
}

// 下棋
function makeMove(row, col) {
    if (gameOver || !currentRoom || board[row][col] !== 0) return;
    
    // 檢查是否輪到當前玩家
    if (playerNumber !== currentPlayer) {
        alert('還沒輪到你下棋！');
        return;
    }
    
    // 模擬發送移動訊息到伺服器
    simulateSendMove(row, col);
    
    // 本地更新
    board[row][col] = currentPlayer;
    updateBoard();
    
    // 檢查遊戲是否結束
    if (isBoardFull()) {
        endGame();
    } else {
        // 切換玩家
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateStatus();
        
        // 模擬廣播給其他玩家
        simulateBroadcastMove(row, col);
    }
}

// 模擬發送移動
function simulateSendMove(row, col) {
    console.log(`發送移動: (${row}, ${col}), 玩家: ${playerNumber}`);
}

// 模擬廣播移動
function simulateBroadcastMove(row, col) {
    // 在真實環境中，這裡會透過 Socket.io 廣播給其他玩家
    console.log(`廣播移動: (${row}, ${col}), 當前玩家: ${currentPlayer}`);
}

// 更新棋盤顯示
function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const value = board[row][col];
        
        cell.textContent = '';
        cell.classList.remove('player1', 'player2', 'disabled');
        
        if (value === 1) {
            cell.textContent = '○';
            cell.classList.add('player1');
        } else if (value === 2) {
            cell.textContent = '✕';
            cell.classList.add('player2');
        }
        
        // 如果不是當前玩家回合，禁用點擊
        if (currentRoom && playerNumber !== currentPlayer) {
            cell.classList.add('disabled');
        }
    });
}

// 更新狀態顯示
function updateStatus() {
    const statusElement = document.getElementById('status');
    if (!currentRoom) {
        statusElement.innerHTML = '等待加入房間...';
    } else if (playerNumber === currentPlayer) {
        statusElement.innerHTML = `<span class="player${currentPlayer}">你的回合！玩家${currentPlayer}</span> - 點擊下棋`;
    } else {
        statusElement.innerHTML = `<span class="player${currentPlayer}">玩家${currentPlayer}</span>的回合 - 等待對手下棋`;
    }
}

// 檢查棋盤是否已滿
function isBoardFull() {
    return board.flat().every(cell => cell !== 0);
}

// 結束遊戲
function endGame() {
    gameOver = true;
    calculateScores();
}

// 計算分數
function calculateScores() {
    let score1 = 0, score2 = 0;
    
    // 檢查所有可能連線方向
    const directions = [
        [0, 1],   // 水平
        [1, 0],   // 垂直
        [1, 1],   // 右下對角
        [1, -1]   // 左下對角
    ];
    
    for (let dir of directions) {
        const [dx, dy] = dir;
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (i + dx * (winLength - 1) < boardSize && 
                    j + dy * (winLength - 1) >= 0 && 
                    j + dy * (winLength - 1) < boardSize) {
                    
                    let line = [];
                    for (let k = 0; k < winLength; k++) {
                        line.push(board[i + dx * k][j + dy * k]);
                    }
                    
                    if (line.every(cell => cell === 1)) score1++;
                    if (line.every(cell => cell === 2)) score2++;
                }
            }
        }
    }
    
    // 更新分數顯示
    document.getElementById('score1').textContent = score1;
    document.getElementById('score2').textContent = score2;
    
    // 顯示結果
    showResult(score1, score2);
}

// 顯示遊戲結果
function showResult(score1, score2) {
    const resultElement = document.getElementById('result');
    let resultHTML = '';
    
    if (score1 > score2) {
        resultHTML = `
            <div style="font-size: 1.5em; margin-bottom: 10px;">🎉 玩家1 獲勝！</div>
            <div class="player1" style="font-size: 1.2em;">○: ${score1} 條連線</div>
            <div class="player2">✕: ${score2} 條連線</div>
        `;
    } else if (score2 > score1) {
        resultHTML = `
            <div style="font-size: 1.5em; margin-bottom: 10px;">🎉 玩家2 獲勝！</div>
            <div class="player1">○: ${score1} 條連線</div>
            <div class="player2" style="font-size: 1.2em;">✕: ${score2} 條連線</div>
        `;
    } else {
        resultHTML = `
            <div style="font-size: 1.5em; margin-bottom: 10px;">🤝 平手！</div>
            <div class="player1">○: ${score1} 條連線</div>
            <div class="player2">✕: ${score2} 條連線</div>
        `;
    }
    
    resultElement.innerHTML = resultHTML;
    resultElement.style.display = 'block';
    
    // 模擬發送遊戲結果
    simulateSendGameResult(score1, score2);
}

// 模擬發送遊戲結果
function simulateSendGameResult(score1, score2) {
    console.log(`遊戲結束！玩家1: ${score1}, 玩家2: ${score2}`);
}

// 更新棋盤大小
function updateBoardSize() {
    boardSize = parseInt(document.getElementById('boardSize').value);
    if (currentRoom && !gameOver) {
        if (confirm('更改棋盤大小將重置當前遊戲，確定嗎？')) {
            resetGame();
        }
    } else {
        resetGame();
    }
}

// 更新連線長度
function updateWinLength() {
    winLength = parseInt(document.getElementById('winLength').value);
}

// 重置遊戲
function resetGame() {
    currentPlayer = 1;
    gameOver = false;
    document.getElementById('result').style.display = 'none';
    document.getElementById('score1').textContent = '0';
    document.getElementById('score2').textContent = '0';
    createBoard();
    updateStatus();
    
    // 模擬發送重置訊息
    if (currentRoom) {
        simulateSendReset();
    }
}

// 模擬發送重置訊息
function simulateSendReset() {
    console.log('發送重置遊戲訊息');
}

// 離開房間
function leaveRoom() {
    if (currentRoom) {
        if (confirm('確定要離開房間嗎？')) {
            currentRoom = null;
            playerNumber = 0;
            document.getElementById('roomStatus').textContent = '未加入房間';
            document.getElementById('playerInfo').textContent = '玩家: -';
            document.getElementById('playersList').innerHTML = '';
            resetGame();
            document.getElementById('status').textContent = '等待加入房間...';
        }
    }
}

// 初始化
window.addEventListener('DOMContentLoaded', initGame);