let ws = null;
const serverUrl = 'ws://192.168.10.110:80';

const connectBtn = document.getElementById('connectBtn');
const statusSpan = document.getElementById('status');
const xdhtml = document.getElementById('pxd');
const gameView = document.getElementById('gameview');
const connectView = document.getElementById('connectview');

connectBtn.addEventListener('click', connectWebSocket);

var playingGame = false;
var startGame = false;

// 読み込んだセンサーデータ
var bd = 0;
var xd = 0;
var yd = 0;

const canvas = document.getElementById('view');
const ctx = canvas.getContext('2d');

const carImage = new Image();
carImage.src = 'images/topview_car.png';

const grassImage = new Image();
grassImage.src = 'images/kusa_simple5.png';

const stoneImage = new Image();
stoneImage.src = 'images/nature_stone_iwa.png';

const bombImage = new Image();
bombImage.src = 'images/bakuhatsu3.png';

// const titleBGM = new Audio('audio/bgm/nandainoitteme.wav');
// const gameBGM = new Audio('audio/bgm/saranarukunann.wav');

const titleBGM = 'audio/bgm/nandainoitteme.wav';
const gameBGM = 'audio/bgm/saranarukunann.wav';

const bgmPlayer = document.createElement('audio');

var playerHitBox = [0, 0, 50, 50];
var stoneHitBox = [
    [0, -500, 50, 50],
    [0, -500, 50, 50],
    [0, -500, 50, 50],
    [0, -500, 50, 50]
];

var road1Route = 0;
var road2Route = 0;
var beforeRoute1 = 0;
var beforeRoute2 = 0;

var routeMaxTime = 30;

var routeTurnTiming1 = 0;
var routeTurnTiming2 = 0;
var route1Time = routeMaxTime;
var route2Time = routeMaxTime;

var road1XY = Array(60);
var road2XY = Array(60);
road1XY.fill(0);
road2XY.fill(0);

var playerX = 0;
var playerVelo = 0;

var timer = 0;
var refreshTime = 240;
var isStop = false;

// window.onload = function() {
//     bgmPlayer.src = titleBGM;
//     bgmPlayer.play();
// };

function connectWebSocket() {
    statusSpan.textContent = '接続中...';
    // addLog('接続中...');

    ws = new WebSocket(serverUrl);

    ws.onopen = function () {
        statusSpan.textContent = '接続済み';
        playingGame = true;
        // addLog('接続成功');
        updateButtons();
    };

    ws.onmessage = function (event) {
        console.log('データタイプ:', typeof event.data);
        try {
            const sensorData = JSON.parse(event.data);
            bd = sensorData['button'];
            xd = sensorData['Y'];
            yd = sensorData['X'];

            xdhtml.innerHTML = `xd: ${xd}`;

        } catch (e) {
            // addLog('受信: ' + e);
        }

    };

    ws.onclose = function () {
        statusSpan.textContent = '切断中';
        playingGame = false;
        // addLog('接続終了');
        updateButtons();
        ws = null;
    };

    ws.onerror = function () {
        statusSpan.textContent = 'エラー';
        // addLog('接続エラー');
        updateButtons();
    };
}

// ボタン状態更新
function updateButtons() {
    const connected = ws && ws.readyState === WebSocket.OPEN;
    connectBtn.disabled = connected;
    // disconnectBtn.disabled = !connected;
    // sendBtn.disabled = !connected;
    // messageInput.disabled = !connected;
}

// WebSocket切断
function disconnectWebSocket() {
    if (ws) {
        ws.close();
    }
}

var sec = 0;
var score = 0;
var level = 1;
var grassPos = [[30, 0], [250, 150], [100, 300], [0, 450], [0, 600]];
var stonePos = [
    [0, -500],
    [0, -500],
    [0, -500],
    [0, -500]
]
function drawGame() {
    if (playingGame) {
        
        // if (timer < refreshTime) timer++;
        // else {
        //     timer = 0;
        //     // refreshTime /= speed;
        // }
        timer++;
        // if(timer % 60 == 0) console.log(timer);
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'darkgreen';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // if (route1Time < routeMaxTime) route1Time++;
        // if (route2Time < routeMaxTime) route2Time++;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'darkgreen';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'Wheat';

        if (road1Route == beforeRoute1) {
            routeTurnTiming1 = Math.floor(Math.random() * 100);
            if (routeTurnTiming1 > 95) {
                road1Route = Math.floor(Math.random() * 50) - 25;
                route1Time = 0;
            }
        }
        if (road2Route == beforeRoute2) {
            routeTurnTiming2 = Math.floor(Math.random() * 100);
            if (routeTurnTiming2 > 95) {
                road2Route = Math.floor(Math.random() * 50) - 25;
                route2Time = 0;
            }
        }
        for (let i = 59; i >= 0; i--) {
            if (i > 0) {
                road1XY[i] = road1XY[i - 1];
            }
            else {
                road1XY[i] = beforeRoute1 + ((road1Route - beforeRoute1) * (route1Time / routeMaxTime));
            }
        }
        for (let i = 59; i >= 0; i--) {
            if (i > 0) {
                road2XY[i] = road2XY[i - 1];
            }
            else {
                road2XY[i] = beforeRoute2 + ((road2Route - beforeRoute2) * (route2Time / routeMaxTime));
            }
        }
        if (route1Time >= routeMaxTime) beforeRoute1 = road1Route;
        if (route2Time >= routeMaxTime) beforeRoute2 = road2Route;

        for (let i = 0; i < 60; i++) {
            // ctx.fillRect(road1XY[i] + 225, i * 10, 100, 100);
            ctx.fillRect(road1XY[i] + 75, i * 10, 100, 10);
        }

        for (let i = 0; i < 60; i++) {
            ctx.fillRect(road2XY[i] + 225, i * 10, 100, 10);
        }
        const mag = 0.35;
        const carsizeX = 336 * mag;
        const carsizeY = 450 * mag;
        const grasssizeX = 200 * mag * 0.8;
        const grasssizeY = 98 * mag * 0.8;
        const stonesizeX = 400 * mag * 0.5;
        const stonesizeY = 362 * mag * 0.5;
        var speed = 1;

        
        if (!startGame && !isStop) {
            if (timer % 60 == 0) {
                sec++;
            }
            switch(sec) {
                case 0:
                    ctx.fillStyle = 'red';
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 5;
                    ctx.font = '100px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('3', canvas.width/2, canvas.height/2);
                    ctx.strokeText('3', canvas.width/2, canvas.height/2);
                    break;
                case 1:
                    ctx.fillStyle = 'red';
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 5;
                    ctx.font = '100px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('2', canvas.width/2, canvas.height/2);
                    ctx.strokeText('2', canvas.width/2, canvas.height/2);
                    break;
                case 2:
                    ctx.fillStyle = 'red';
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 5;
                    ctx.font = '100px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('1', canvas.width/2, canvas.height/2);
                    ctx.strokeText('1', canvas.width/2, canvas.height/2);
                    break;
                case 3:
                    ctx.fillStyle = 'orange';
                    ctx.strokeStyle = 'orange';
                    ctx.lineWidth = 5;
                    ctx.font = '80px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('スタート！', canvas.width/2, canvas.height/2);
                    ctx.strokeText('スタート！', canvas.width/2, canvas.height/2);
                    break;
                case 4:
                    startGame = true;
                    timer = 1;
                    for (let i = 0; i < 4; i++)
                    {
                        stonePos[i][1] = -stonesizeY - (Math.floor(Math.random() * 600) - 10);
                        stonePos[i][0] = Math.floor(Math.random() * (canvas.width + 30)) - 30;
                        stoneHitBox[i][0] = stonePos[i][0] + 10;
                        stoneHitBox[i][1] = stonePos[i][1] + 20;
                        stoneHitBox[i][2] = stonesizeX-20;
                        stoneHitBox[i][3] = stonesizeY-30;
                    }
                    break;
            }

        }
        if (startGame && !isStop) {
            // console.log(road1XY[0]);
            document.getElementById("score").innerHTML = `Score : ${String(score).padStart(5, '0')}`;
            document.getElementById("level").innerHTML = `Level : ${level}`;
            if (xd < 50 && xd > -50) xd = 0;
            if (bd == 1) speed = 2;
            else speed = 1;
            playerVelo = xd * 0.02 * speed;
            if (playerX < ((-canvas.width / 2) + carsizeX / 2)) playerX = (-canvas.width / 2) + carsizeX / 2;
            if (playerX > ((canvas.width / 2) - carsizeX / 2)) playerX = (canvas.width / 2) - carsizeX / 2;
            playerX += playerVelo;
            
            if (!isStop) {
                score++;
                if (timer % 800 == 0) {
                    level++;
                }
                for (let i = 0; i < 5; i++)
                {
                    grassPos[i][1] += 5 + (level-1) * 0.5;
                    if (grassPos[i][1] > canvas.height) {
                        grassPos[i][1] = -grasssizeY - (Math.floor(Math.random() * canvas.height));
                        grassPos[i][0] = Math.floor(Math.random() * (canvas.width + 30)) - 30;
                    }
                }
                for (let i = 0; i < 4; i++)
                {
                    stonePos[i][1] += 5 + (level-1) * 0.5;
                    if (stonePos[i][1] > canvas.height) {
                        stonePos[i][1] = -stonesizeY - (Math.floor(Math.random() * 1200));
                        stonePos[i][0] = Math.floor(Math.random() * (canvas.width + 30)) - 30;
                        
                    }
                    stoneHitBox[i][0] = stonePos[i][0] + 10;
                    stoneHitBox[i][1] = stonePos[i][1] + 20;
                    stoneHitBox[i][2] = stonesizeX - 20;
                    stoneHitBox[i][3] = stonesizeY - 30;
                }
            }
            
        }
        for (let i = 0; i < 5; i++) {
            ctx.drawImage(grassImage, grassPos[i][0], grassPos[i][1], grasssizeX, grasssizeY);
        }
        for (let i = 0; i < 4; i++) {
            ctx.drawImage(stoneImage, stonePos[i][0], stonePos[i][1], stonesizeX, stonesizeY);
            ctx.fillStyle = 'red';
            // 石の当たり判定可視化
            // ctx.fillRect(stoneHitBox[i][0], stoneHitBox[i][1], stoneHitBox[i][2], stoneHitBox[i][3]);
        }

        /*
        [0] = 左
        [0]+[2] = 右
        [1] = 上
        [1]+[3] = 下
        
        */
        
        if (!isStop) {
            for (let i = 0; i < 4; i++) {
                const playerLeft = playerHitBox[0];
                const playerTop = playerHitBox[1];
                const playerRight = playerHitBox[0] + playerHitBox[2];
                const playerBottom = playerHitBox[1] + playerHitBox[3];
    
                const stoneLeft = stoneHitBox[i][0];
                const stoneTop = stoneHitBox[i][1];
                const stoneRight = stoneHitBox[i][0] + stoneHitBox[i][2];
                const stoneBottom = stoneHitBox[i][1] + stoneHitBox[i][3];
    
                if ((playerTop < stoneBottom && stoneTop < playerBottom) && (playerLeft < stoneRight && stoneLeft < playerRight)) {
                    // console.log('hit!');
                    isStop = true;
                    timer = 1;
                    sec = 0;
                }
            }

        }
        else {
            ctx.fillStyle = 'black';
            ctx.font = '70px sans-serif';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 6;
            ctx.textAlign = 'center';
            ctx.strokeText('GAME OVER', canvas.width/2, canvas.height/2);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.strokeText('GAME OVER', canvas.width/2, canvas.height/2);
            ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
        }
        
        var playerPos = playerX - (carsizeX / 2) + (canvas.width / 2);
        ctx.fillStyle = 'blue';
        playerHitBox[0] = playerPos + 30;
        playerHitBox[1] = canvas.height - carsizeY + 20;
        playerHitBox[2] = carsizeX - 60;
        playerHitBox[3] = carsizeY - 40;
        ctx.drawImage(carImage, playerPos, canvas.height - carsizeY, carsizeX, carsizeY);
        // プレイヤー当たり判定可視化
        // ctx.fillRect(playerHitBox[0], playerHitBox[1], playerHitBox[2], playerHitBox[3]);
        if (isStop) ctx.drawImage(bombImage, playerPos - 10, canvas.height - carsizeY - 50);
    }
    else {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'darkgreen';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '20px sans-serif';
        ctx.fillStyle = 'yellow';
        ctx.textAlign = 'center';
        ctx.fillText('画面をクリックすると音が鳴るよ！', canvas.width/2, 100);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'start';
        ctx.font = '30px sans-serif';
        ctx.fillText('遊び方', 20, 150);
        ctx.font = '20px sans-serif';
        ctx.fillText('[接続開始]をクリックしよう！', 20, 190);
        ctx.fillText('カウントダウンが終わったら', 20, 215);
        ctx.fillText('ジョイスティックを倒すと車が動く！', 20, 240);
        ctx.fillStyle = 'lime';
        ctx.fillText('Aボタン', 20, 265);
        ctx.fillStyle = 'white';
        ctx.fillText('でちょっとだけ車が速くなる！', 95, 265);

        ctx.font = '40px sans-serif';
        ctx.drawImage(stoneImage, 20, 350, 400 * 0.35 * 0.8, 362 * 0.35 * 0.8);
        ctx.fillText('を避けよう！', 140, 430);
    }


    requestAnimationFrame(drawGame);//繰り返し呼び出す
}
drawGame();

canvas.addEventListener("click", e => {
    if (bgmPlayer.paused && !playingGame) {
        if (!playingGame) {
            bgmPlayer.loop = true;
            bgmPlayer.volume = 0.2;
            bgmPlayer.src = titleBGM;
            bgmPlayer.play();
        }

    }
});