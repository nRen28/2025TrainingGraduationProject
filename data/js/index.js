let ws = null;
const serverUrl = 'ws://192.168.10.110:80';

// DOM要素
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const sendBtn = document.getElementById('sendBtn');
const messageInput = document.getElementById('messageInput');
const statusSpan = document.getElementById('status');
const logDiv = document.getElementById('log');
const buttonData = document.getElementById('pressedBtn');
const accData = document.getElementById('acce');
const rotateData = document.getElementById('rotate');
const tempData = document.getElementById('temp');
const radiData = document.getElementById('radian');

// 読み込んだセンサーデータ
var bd = 0;
var adx = 0;
var ady = 0;
var adz = 0;
var gdx = 0;
var gdy = 0;
var gdz = 0;
var td = 0;
var pd = 0;
var rd = 0;
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
            bd = sensorData['sensorData']['button'];
            adx = sensorData['sensorData']['Acc'][0];
            ady = sensorData['sensorData']['Acc'][1];
            adz = sensorData['sensorData']['Acc'][2];
            gdx = sensorData['sensorData']['Rotate'][0];
            gdy = sensorData['sensorData']['Rotate'][1];
            gdz = sensorData['sensorData']['Rotate'][2];
            td = sensorData['sensorData']['Temp'];
            pd = sensorData['sensorData']['pitch'];
            rd = sensorData['sensorData']['roll'];
            yd = sensorData['sensorData']['yaw'];

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
            accData.innerHTML = `Acc: <font color="#1F77B4">X</font>, <font color="#FF871D">Y</font>, <font color="#2CA02C">Z</font><br>X = ${adx},<br>Y = ${ady},<br>Z = ${adz} m/s^2`;
            rotateData.innerHTML = `Rotate: <font color="#1F77B4">X</font>, <font color="#FF871D">Y</font>, <font color="#2CA02C">Z</font><br>X = ${gdx},<br>Y = ${gdy},<br>Z = ${gdz} rad/s`;
            radiData.innerHTML = `Rad: <font color="#1F77B4">Roll</font>, <font color="#FF871D">Pitch</font>, <font color="#2CA02C">Yaw</font><br>Roll = ${rd},<br>Pitch = ${pd},<br>Yaw = ${yd} rad`
            tempData.innerHTML = `Temp: ${td} degC`;
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

function getChartTime() {
    var date = new Date();
    var ms = date.getTime();
    return Math.floor(ms / 1000);
}

function showAccGraph() {
    var data = [
        {
            label: "加速度センサーX",
            values: [ {time: 0, y: 0} ],
            range: [-10, 10]
        },
        {
            label: "加速度センサーY",
            values: [ {time: 0, y: 0} ],
            range: [-10, 10]
        },
        {
            label: "加速度センサーZ",
            values: [ {time: 0, y: 0} ],
            range: [-10, 10]
        }
    ];

    var chart = $('#acc').epoch({
        type: 'time.line',
        data: data,
        axes: ['left', 'bottom']
    });

    setInterval(function() {
        chart.push([
            {time: getChartTime(), y: adx},
            {time: getChartTime(), y: ady},
            {time: getChartTime(), y: adz}
        ])
    }, 1000);
}

function showGyroGraph() {
    var data = [
        {
            label: "ジャイロセンサーX",
            values: [ {time: 0, y: 0} ],
            range: [-5, 5]
        },
        {
            label: "ジャイロセンサーY",
            values: [ {time: 0, y: 0} ],
            range: [-5, 5]
        },
        {
            label: "ジャイロセンサーZ",
            values: [ {time: 0, y: 0} ],
            range: [-5, 5]
        }
    ];

    var chart = $('#gyro').epoch({
        type: 'time.line',
        data: data,
        axes: ['left', 'bottom']
    });

    setInterval(function() {
        chart.push([
            {time: getChartTime(), y: gdx},
            {time: getChartTime(), y: gdy},
            {time: getChartTime(), y: gdz}
        ])
    }, 1000);
}

function showRadian() {
    var data = [
        {
            label: "角度X",
            values: [ {time: 0, y: 0} ],
            range: [-5, 5]
        },
        {
            label: "角度Y",
            values: [ {time: 0, y: 0} ],
            range: [-5, 5]
        },
        {
            label: "角度Z",
            values: [ {time: 0, y: 0} ],
            range: [-5, 5]
        }
    ];

    var chart = $('#radi').epoch({
        type: 'time.line',
        data: data,
        axes: ['left', 'bottom']
    });

    setInterval(function() {
        chart.push([
            {time: getChartTime(), y: rd},
            {time: getChartTime(), y: pd},
            {time: getChartTime(), y: yd}
        ])
    }, 1000);
}

function showTempGraph() {
    var data = [
        {
            label: "温度",
            values: [ {time: 0, y: 0} ],
            range: [20, 35]
        },
    ];

    var chart = $('#tempg').epoch({
        type: 'time.line',
        data: data,
        axes: ['left', 'bottom']
    });

    setInterval(function() {
        chart.push([
            {time: getChartTime(), y: td},
        ])
    }, 1000);
}

$(document).ready(function() {
    showAccGraph();
    showGyroGraph();
    showTempGraph();
    showRadian();
});

const canvas = document.getElementById('XY');
const canvasB = document.getElementById('buttons');
const ctx = canvas.getContext('2d');
const ctxB = canvasB.getContext('2d');

const revisionAdd = 200;
const revisionMag = 1;

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
    ctx.arc((rd*revisionMag) + revisionAdd, (pd*revisionMag) + revisionAdd, 5, 0, Math.PI + (Math.PI * 2) / 2, true);
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