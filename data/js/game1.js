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
carImage.src = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgHfInSvdQxRAmhLRUfsGqyXZjNkX_AwS8vyVuFgBhYJRAKlWhYyP79vZHWpGwQQh-Bj2WHCQyG-wgq-kw4JQKnLepcPY20EJo21LKmqjTjAhuhz5RPvKdYEALDINhqcjyC83mgSa_g_sc/s450/topview_car.png';

const grassImage = new Image();
grassImage.src = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgn1kxWkcvp6i9kRv9zUYWkNZJZLDHWY0zpixmuG8XWj8zC1LDWnOWX1DtFJrQI3TK8uqF2f7Puu4t2KOiMyzwjKR3dXbtcPRxNZwvUpvH8_EdQogYJfTdQcmGa8SyzNlvJijyEsIZGdHq0/s200/kusa_simple5.png';

const stoneImage = new Image();
stoneImage.src = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiReAu3VdXl-7xmrgsPeJcfiNeky-yZUG2HQ3fT_gphIODNerTe0oC4cmLA3z_8Hrs6X8Att1k1ZkRh4fif2-m39WRN1uYVKkO2bqJzc2NTOD43UDEIlMX_wO3VCkwF-9mdFiaub24wItS1/s400/nature_stone_iwa.png';

const bombImage = new Image();
bombImage.src = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjaJoVbPqEJx7c3mZO5WdnKSxOCHTM-enABNo7kb6M-u4EpNB9tyhMKIxGos9iqV3yKCjNgUCEGN3GR9r2mbgXeMA3h-RjAbNhmbM0Upy8SZfpuxDOuNxTi8TsDQrUcx31OfLouD-Ey-SXp/s150/bakuhatsu3.png';

const titleBGM = 'https://pansound.com/panicpumpkin/music/mp3/BGM158-131031-nandainoitteme-mp3.mp3';
const gameBGM = 'https://pansound.com/panicpumpkin/music/mp3/BGM138-121031-saranarukunan-mp3.mp3';
const countSE = 'https://pansound.com/panicpumpkin/music/se/error.wav';
const startSE = 'https://pansound.com/panicpumpkin/music/se/kettei_daiketteifantasy.wav';
const bombSE = 'https://pansound.com/panicpumpkin/music/se/honoobakuhatsu.wav';
const gameoverJingle = 'https://pansound.com/panicpumpkin/music/wav/ME039-141031-clear11-wav.wav';

const titleBGMPlayer = document.createElement('audio');
const gameBGMPlayer = document.createElement('audio');
const countDownSEPlayer = document.createElement('audio');
const startSEPlayer = document.createElement('audio');
const bombSEPlayer = document.createElement('audio');
const gameOverSEPlayer = document.createElement('audio');

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

window.onload = function () {
    titleBGMPlayer.pause();
    gameBGMPlayer.pause();
    countDownSEPlayer.pause();
    startSEPlayer.pause();
    bombSEPlayer.pause();
    gameOverSEPlayer.pause();
    titleBGMPlayer.volume = 0.25
    gameBGMPlayer.volume = 0.25
    countDownSEPlayer.volume = 0.25
    startSEPlayer.volume = 0.25
    bombSEPlayer.volume = 0.25
    gameOverSEPlayer.volume = 0.25
    titleBGMPlayer.src = titleBGM;
    gameBGMPlayer.src = gameBGM;
    countDownSEPlayer.src = countSE;
    startSEPlayer.src = startSE;
    bombSEPlayer.src = bombSE;
    gameOverSEPlayer.src = gameoverJingle;

    titleBGMPlayer.loop = true;
    gameBGMPlayer.loop = true;

};

function connectWebSocket() {
    statusSpan.textContent = '接続中...';
    // addLog('接続中...');

    ws = new WebSocket(serverUrl);

    ws.onopen = function () {
        statusSpan.textContent = '接続済み';
        playingGame = true;
        titleBGMPlayer.pause();
        countDownSEPlayer.currentTime = 0;
        countDownSEPlayer.play();
        // addLog('接続成功');
        updateButtons();
    };

    ws.onmessage = function (event) {
        // console.log('データタイプ:', typeof event.data);
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
var highscore = 0;
var highlevel = 1;
var grassPos = [[30, 0], [250, 150], [100, 300], [0, 450], [0, 600]];
var stonePos = [
    [0, -500],
    [0, -500],
    [0, -500],
    [0, -500]
]
function drawGame() {
    if (playingGame) {
        timer++;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'darkgreen';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'darkgreen';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'Wheat';

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

        if (!startGame && !isStop) {
            if (timer % 60 == 0) {
                sec++;
                if (sec < 3) {
                    countDownSEPlayer.currentTime = 0;
                    countDownSEPlayer.play();
                }
                else if (sec == 3) {
                    startSEPlayer.currentTime = 0;
                    startSEPlayer.play();
                }
                else if (sec == 4) {
                    gameBGMPlayer.currentTime = 0;
                    gameBGMPlayer.play();
                }
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
                    gameBGMPlayer.pause();
                    bombSEPlayer.currentTime = 0;
                    bombSEPlayer.play();
                }
            }

        }
        else {
            if (timer % 60 == 0) {
                sec++;
                if (sec == 2) {
                    gameOverSEPlayer.currentTime = 0;
                    gameOverSEPlayer.play();
                }
            }
            // console.log(sec);
            if (sec >= 2) {
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
            
                ctx.strokeStyle = 'white';
                ctx.fillStyle = 'red';
                ctx.font = '35px sans-serif';
                ctx.strokeText('Bボタン', canvas.width/2 - 85, canvas.height/2 + 50);
                ctx.fillText('Bボタン', canvas.width/2 - 85, canvas.height/2 + 50);
                ctx.strokeStyle = 'black';
                ctx.fillStyle = 'white';
                ctx.strokeText('でリトライ', canvas.width/2 + 70, canvas.height/2 + 50);
                ctx.fillText('でリトライ', canvas.width/2 + 70, canvas.height/2 + 50);
            }
            if (bd == 2) gameReset();
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
    if (titleBGMPlayer.paused && !playingGame) {
        if (!playingGame) {
            titleBGMPlayer.currentTime = 0;
            titleBGMPlayer.play();
        }

    }
});

function gameReset() {
    const mag = 0.35;
    const grasssizeY = 98 * mag * 0.8;
    const stonesizeX = 400 * mag * 0.5;
    const stonesizeY = 362 * mag * 0.5;
    if (score > highscore) highscore = score;
    if (level > highlevel) highlevel = level;
    document.getElementById("highscore").innerHTML = `High score : ${String(highscore).padStart(5, '0')}`;
    document.getElementById("highlevel").innerHTML = `High level : ${highlevel}`;
    score = 0;
    timer = 0;
    sec = 0;
    playerX = 0;
    level = 1;
    document.getElementById("score").innerHTML = `Score : ${String(score).padStart(5, '0')}`;
    document.getElementById("level").innerHTML = `Level : ${level}`;
    for (let i = 0; i < 4; i++) {
        stonePos[i][1] = -stonesizeY - (Math.floor(Math.random() * canvas.height) - 10);
        stonePos[i][0] = Math.floor(Math.random() * (canvas.width + 30)) - 30;
        stoneHitBox[i][0] = stonePos[i][0] + 10;
        stoneHitBox[i][1] = stonePos[i][1] + 20;
        stoneHitBox[i][2] = stonesizeX-20;
        stoneHitBox[i][3] = stonesizeY-30;
    }
    for (let i = 0; i < 5; i++) {
        grassPos[i][1] = -grasssizeY + (Math.floor(Math.random() * canvas.height));
        grassPos[i][0] = Math.floor(Math.random() * (canvas.width + 30)) - 30;
    }
    isStop = false;
    startGame = false;
    gameOverSEPlayer.pause();
    countDownSEPlayer.currentTime = 0;
    countDownSEPlayer.play();
}