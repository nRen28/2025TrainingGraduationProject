let ws = null;
const serverUrl = 'ws://192.168.10.110:80';

// DOM要素
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const statusSpan = document.getElementById('status');
const logDiv = document.getElementById('log');
const buttonData = document.getElementById('pressedBtn');

// 読み込んだセンサーデータ
var bd = 0;
var xd = 0;
var yd = 0;

// イベントリスナー
connectBtn.addEventListener('click', connectWebSocket);
disconnectBtn.addEventListener('click', disconnectWebSocket);
//sendBtn.addEventListener('click', sendMessage);

// WebSocket接続
function connectWebSocket() {
    statusSpan.textContent = '接続中...';
    addLog('接続中...');
    
    ws = new WebSocket(serverUrl);
    
    ws.onopen = function() {
        statusSpan.textContent = '接続済み';
        addLog('接続成功');
        updateButtons();
    };
    
    ws.onmessage = function(event) {
        console.log('データタイプ:', typeof event.data);
        try {
            const sensorData = JSON.parse(event.data);
            bd = sensorData['button'];
            xd = sensorData['Y'];
            yd = sensorData['X'];

            switch (bd) {
                case 1:
                    buttonData.innerHTML = 'Pressed : A';
                    break;
                case 2:
                    buttonData.innerHTML = 'Pressed : B';
                    break;
                case 3:
                    buttonData.innerHTML = 'Pressed : X';
                    break;
                case 4:
                    buttonData.innerHTML = 'Pressed : Y';
                    break;
                default:
                    buttonData.innerHTML = 'Pressed : NONE';
                    break;

            }
            
        } catch (e) {
            addLog('受信: ' + e);
        }
        
    };
    
    ws.onclose = function() {
        statusSpan.textContent = '切断中';
        addLog('接続終了');
        updateButtons();
        ws = null;
    };
    
    ws.onerror = function() {
        statusSpan.textContent = 'エラー';
        addLog('接続エラー');
        updateButtons();
    };
}

const canvas = document.getElementById('XY');
const canvasB = document.getElementById('buttons');
const ctx = canvas.getContext('2d');
const ctxB = canvasB.getContext('2d');

const revisionAdd = 200;
const revisionMag = 0.25;

function radiDraw() {
    ctx.clearRect(0,0,canvas.width, canvas.height);//リセット
    ctx.beginPath();
    ctx.strokeStyle = 'gray';
    ctx.moveTo(5, canvas.height/2);
    ctx.lineTo(canvas.width-5, canvas.height/2);
    ctx.moveTo(canvas.width/2, 5);
    ctx.lineTo(canvas.width/2, canvas.height-5);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';
    ctx.arc((xd*revisionMag) + revisionAdd, (yd*-revisionMag) + revisionAdd, 5, 0, Math.PI + (Math.PI * 2) / 2, true);
    ctx.closePath();
    ctx.fill();
    
    requestAnimationFrame(radiDraw);//繰り返し呼び出す
}
radiDraw();

function buttonDraw() {
    ctxB.clearRect(0, 0, canvasB.width, canvasB.height);
    
    ctxB.fillStyle = 'DeepSkyBlue';
    ctxB.strokeStyle = 'darkblue';
    if (bd == 3) ctxB.fillStyle = 'white';
    ctxB.fillRect(5, 5, 40, 40);
    ctxB.strokeRect(5, 5, 40, 40);

    ctxB.fillStyle = 'yellow';
    ctxB.strokeStyle = 'DarkKhaki';
    if (bd == 4) ctxB.fillStyle = 'white';
    ctxB.fillRect(55, 5, 40, 40);
    ctxB.strokeRect(55, 5, 40, 40);

    ctxB.fillStyle = 'LightCoral';
    ctxB.strokeStyle = 'FireBrick';
    if (bd == 2) ctxB.fillStyle = 'white';
    ctxB.fillRect(105, 5, 40, 40);
    ctxB.strokeRect(105, 5, 40, 40);

    ctxB.fillStyle = 'PaleGreen';
    ctxB.strokeStyle = 'ForestGreen';
    if (bd == 1) ctxB.fillStyle = 'white';
    ctxB.fillRect(155, 5, 40, 40);
    ctxB.strokeRect(155, 5, 40, 40);


    requestAnimationFrame(buttonDraw);
}
buttonDraw();

// WebSocket切断
function disconnectWebSocket() {
    if (ws) {
        ws.close();
    }
}

// メッセージ送信
function sendMessage() {
    const message = messageInput.value;
    if (message && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        addLog('送信: ' + message);
        messageInput.value = '';
    }
}

// ボタン状態更新
function updateButtons() {
    const connected = ws && ws.readyState === WebSocket.OPEN;
    connectBtn.disabled = connected;
    disconnectBtn.disabled = !connected;
    // sendBtn.disabled = !connected;
    // messageInput.disabled = !connected;
}

// ログ追加
function addLog(message) {
    const time = new Date().toLocaleTimeString();
    logDiv.innerHTML += `[${time}] ${message}<br>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

// ログクリア
function clearLog() {
    logDiv.innerHTML = '';
}

window.onbeforeunload = function() {
    if (ws && isConnected) {
        ws.close();
    }
};