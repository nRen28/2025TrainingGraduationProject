# define JS_DATA_A "\
let ws = null;\
const serverUrl = \'ws://"

# define JS_DATA_B "\
:80\';\n\
\n\
const connectBtn = document.getElementById(\'connectBtn\');\n\
const statusSpan = document.getElementById(\'status\');\n\
const xdhtml = document.getElementById(\'pxd\');\n\
const gameView = document.getElementById(\'gameview\');\n\
const connectView = document.getElementById(\'connectview\');\n\
\n\
connectBtn.addEventListener(\'click\', connectWebSocket);\n\
\n\
var playingGame = false;\n\
var startGame = false;\n\
\n\
// 読み込んだセンサーデータ\n\
var bd = 0;\n\
var xd = 0;\n\
var yd = 0;\n\
\n\
const canvas = document.getElementById(\'view\');\n\
const ctx = canvas.getContext(\'2d\');\n\
\n\
const carImage = new Image();\n\
// carImage.src = \'images/topview_car.png\';\n\
carImage.src = \'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgHfInSvdQxRAmhLRUfsGqyXZjNkX_AwS8vyVuFgBhYJRAKlWhYyP79vZHWpGwQQh-Bj2WHCQyG-wgq-kw4JQKnLepcPY20EJo21LKmqjTjAhuhz5RPvKdYEALDINhqcjyC83mgSa_g_sc/s450/topview_car.png\';\n\
\n\
const grassImage = new Image();\n\
// grassImage.src = \'images/kusa_simple5.png\';\n\
grassImage.src = \'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgn1kxWkcvp6i9kRv9zUYWkNZJZLDHWY0zpixmuG8XWj8zC1LDWnOWX1DtFJrQI3TK8uqF2f7Puu4t2KOiMyzwjKR3dXbtcPRxNZwvUpvH8_EdQogYJfTdQcmGa8SyzNlvJijyEsIZGdHq0/s200/kusa_simple5.png\';\n\
\n\
const stoneImage = new Image();\n\
// stoneImage.src = \'images/nature_stone_iwa.png\';\n\
stoneImage.src = \'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiReAu3VdXl-7xmrgsPeJcfiNeky-yZUG2HQ3fT_gphIODNerTe0oC4cmLA3z_8Hrs6X8Att1k1ZkRh4fif2-m39WRN1uYVKkO2bqJzc2NTOD43UDEIlMX_wO3VCkwF-9mdFiaub24wItS1/s400/nature_stone_iwa.png\';\n\
\n\
const bombImage = new Image();\n\
// bombImage.src = \'images/bakuhatsu3.png\';\n\
bombImage.src = \'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjaJoVbPqEJx7c3mZO5WdnKSxOCHTM-enABNo7kb6M-u4EpNB9tyhMKIxGos9iqV3yKCjNgUCEGN3GR9r2mbgXeMA3h-RjAbNhmbM0Upy8SZfpuxDOuNxTi8TsDQrUcx31OfLouD-Ey-SXp/s150/bakuhatsu3.png\';\n\
\n\
// const titleBGM = new Audio(\'audio/bgm/nandainoitteme.wav\');\n\
// const gameBGM = new Audio(\'audio/bgm/saranarukunann.wav\');\n\
\n\
// const titleBGM = \'audio/bgm/nandainoitteme.wav\';\n\
const titleBGM = \'https://pansound.com/panicpumpkin/music/mp3/BGM158-131031-nandainoitteme-mp3.mp3\';\n\
// const gameBGM = \'audio/bgm/saranarukunann.wav\';\n\
const gameBGM = \'https://pansound.com/panicpumpkin/music/mp3/BGM138-121031-saranarukunan-mp3.mp3\';\n\
// const countSE = \'audio/se/count.wav\';\n\
const countSE = \'https://pansound.com/panicpumpkin/music/se/error.wav\';\n\
// const startSE = \'audio/se/start.wav\';\n\
const startSE = \'https://pansound.com/panicpumpkin/music/se/kettei_daiketteifantasy.wav\';\n\
// const bombSE = \'audio/se/honoobakuhatsu.wav\';\n\
const bombSE = \'https://pansound.com/panicpumpkin/music/se/honoobakuhatsu.wav\';\n\
// const gameoverJingle = \'audio/se/gameover.wav\';\n\
const gameoverJingle = \'https://pansound.com/panicpumpkin/music/wav/ME039-141031-clear11-wav.wav\';\n\
\n\
const bgmPlayer = document.createElement(\'audio\');\n\
const sePlayer = document.createElement(\'audio\');\n\
\n\
var playerHitBox = [0, 0, 50, 50];\n\
var stoneHitBox = [\n\
    [0, -500, 50, 50],\n\
    [0, -500, 50, 50],\n\
    [0, -500, 50, 50],\n\
    [0, -500, 50, 50]\n\
];\n\
\n\
var road1Route = 0;\n\
var road2Route = 0;\n\
var beforeRoute1 = 0;\n\
var beforeRoute2 = 0;\n\
\n\
var routeMaxTime = 30;\n\
\n\
var routeTurnTiming1 = 0;\n\
var routeTurnTiming2 = 0;\n\
var route1Time = routeMaxTime;\n\
var route2Time = routeMaxTime;\n\
\n\
var road1XY = Array(60);\n\
var road2XY = Array(60);\n\
road1XY.fill(0);\n\
road2XY.fill(0);\n\
\n\
var playerX = 0;\n\
var playerVelo = 0;\n\
\n\
var timer = 0;\n\
var refreshTime = 240;\n\
var isStop = false;\n\
\n\
// window.onload = function() {\n\
//     bgmPlayer.src = titleBGM;\n\
//     bgmPlayer.play();\n\
// };\n\
\n\
window.onload = function () {\n\
    sePlayer.volume = 0.25;\n\
    bgmPlayer.volume = 0.25;\n\
\n\
};\n\
\n\
function connectWebSocket() {\n\
    statusSpan.textContent = \'接続中...\';\n\
    // addLog(\'接続中...\');\n\
\n\
    ws = new WebSocket(serverUrl);\n\
\n\
    ws.onopen = function () {\n\
        statusSpan.textContent = \'接続済み\';\n\
        bgmPlayer.pause();\n\
        playingGame = true;\n\
        sePlayer.src = countSE;\n\
        sePlayer.play();\n\
        // addLog(\'接続成功\');\n\
        updateButtons();\n\
    };\n\
\n\
    ws.onmessage = function (event) {\n\
        // console.log(\'データタイプ:\', typeof event.data);\n\
        try {\n\
            const sensorData = JSON.parse(event.data);\n\
            bd = sensorData[\'button\'];\n\
            xd = sensorData[\'Y\'];\n\
            yd = sensorData[\'X\'];\n\
\n\
            xdhtml.innerHTML = `xd: ${xd}`;\n\
\n\
        } catch (e) {\n\
            // addLog(\'受信: \' + e);\n\
        }\n\
\n\
    };\n\
\n\
    ws.onclose = function () {\n\
        statusSpan.textContent = \'切断中\';\n\
        playingGame = false;\n\
        // addLog(\'接続終了\');\n\
        updateButtons();\n\
        ws = null;\n\
    };\n\
\n\
    ws.onerror = function () {\n\
        statusSpan.textContent = \'エラー\';\n\
        // addLog(\'接続エラー\');\n\
        updateButtons();\n\
    };\n\
}\n\
\n\
// ボタン状態更新\n\
function updateButtons() {\n\
    const connected = ws \&\& ws.readyState === WebSocket.OPEN;\n\
    connectBtn.disabled = connected;\n\
    // disconnectBtn.disabled = !connected;\n\
    // sendBtn.disabled = !connected;\n\
    // messageInput.disabled = !connected;\n\
}\n\
\n\
// WebSocket切断\n\
function disconnectWebSocket() {\n\
    if (ws) {\n\
        ws.close();\n\
    }\n\
}\n\
\n\
var sec = 0;\n\
var score = 0;\n\
var level = 1;\n\
var grassPos = [[30, 0], [250, 150], [100, 300], [0, 450], [0, 600]];\n\
var stonePos = [\n\
    [0, -500],\n\
    [0, -500],\n\
    [0, -500],\n\
    [0, -500]\n\
]\n\
function drawGame() {\n\
    if (playingGame) {\n\
        \n\
        // if (timer < refreshTime) timer++;\n\
        // else {\n\
        //     timer = 0;\n\
        //     // refreshTime /= speed;\n\
        // }\n\
        timer++;\n\
        // if(timer \% 60 == 0) console.log(timer);\n\
        \n\
        ctx.fillStyle = \'white\';\n\
        ctx.fillRect(0, 0, canvas.width, canvas.height);\n\
        ctx.fillStyle = \'darkgreen\';\n\
        ctx.fillRect(0, 0, canvas.width, canvas.height);\n\
        // if (route1Time < routeMaxTime) route1Time++;\n\
        // if (route2Time < routeMaxTime) route2Time++;\n\
        ctx.fillStyle = \'white\';\n\
        ctx.fillRect(0, 0, canvas.width, canvas.height);\n\
\n\
        ctx.fillStyle = \'darkgreen\';\n\
        ctx.fillRect(0, 0, canvas.width, canvas.height);\n\
\n\
        ctx.fillStyle = \'Wheat\';\n\
\n\
        if (road1Route == beforeRoute1) {\n\
            routeTurnTiming1 = Math.floor(Math.random() * 100);\n\
            if (routeTurnTiming1 > 95) {\n\
                road1Route = Math.floor(Math.random() * 50) - 25;\n\
                route1Time = 0;\n\
            }\n\
        }\n\
        if (road2Route == beforeRoute2) {\n\
            routeTurnTiming2 = Math.floor(Math.random() * 100);\n\
            if (routeTurnTiming2 > 95) {\n\
                road2Route = Math.floor(Math.random() * 50) - 25;\n\
                route2Time = 0;\n\
            }\n\
        }\n\
        for (let i = 59; i >= 0; i--) {\n\
            if (i > 0) {\n\
                road1XY[i] = road1XY[i - 1];\n\
            }\n\
            else {\n\
                road1XY[i] = beforeRoute1 + ((road1Route - beforeRoute1) * (route1Time / routeMaxTime));\n\
            }\n\
        }\n\
        for (let i = 59; i >= 0; i--) {\n\
            if (i > 0) {\n\
                road2XY[i] = road2XY[i - 1];\n\
            }\n\
            else {\n\
                road2XY[i] = beforeRoute2 + ((road2Route - beforeRoute2) * (route2Time / routeMaxTime));\n\
            }\n\
        }\n\
        if (route1Time >= routeMaxTime) beforeRoute1 = road1Route;\n\
        if (route2Time >= routeMaxTime) beforeRoute2 = road2Route;\n\
\n\
        for (let i = 0; i < 60; i++) {\n\
            // ctx.fillRect(road1XY[i] + 225, i * 10, 100, 100);\n\
            ctx.fillRect(road1XY[i] + 75, i * 10, 100, 10);\n\
        }\n\
\n\
        for (let i = 0; i < 60; i++) {\n\
            ctx.fillRect(road2XY[i] + 225, i * 10, 100, 10);\n\
        }\n\
        const mag = 0.35;\n\
        const carsizeX = 336 * mag;\n\
        const carsizeY = 450 * mag;\n\
        const grasssizeX = 200 * mag * 0.8;\n\
        const grasssizeY = 98 * mag * 0.8;\n\
        const stonesizeX = 400 * mag * 0.5;\n\
        const stonesizeY = 362 * mag * 0.5;\n\
        var speed = 1;\n\
\n\
        \n\
        if (!startGame \&\& !isStop) {\n\
            if (timer \% 60 == 0) {\n\
                sec++;\n\
                if (sec < 3) {\n\
                    sePlayer.src = countSE;\n\
                    sePlayer.play();\n\
                }\n\
                else if (sec == 3) {\n\
                    sePlayer.src = startSE;\n\
                    sePlayer.play();\n\
                }\n\
                else if (sec == 4) {\n\
                    bgmPlayer.src = gameBGM;\n\
                    bgmPlayer.loop\n\
                    bgmPlayer.play();\n\
                }\n\
            }\n\
            switch(sec) {\n\
                case 0:\n\
                    ctx.fillStyle = \'red\';\n\
                    ctx.strokeStyle = \'red\';\n\
                    ctx.lineWidth = 5;\n\
                    ctx.font = \'100px sans-serif\';\n\
                    ctx.textAlign = \'center\';\n\
                    ctx.fillText(\'3\', canvas.width/2, canvas.height/2);\n\
                    ctx.strokeText(\'3\', canvas.width/2, canvas.height/2);\n\
                    break;\n\
                case 1:\n\
                    ctx.fillStyle = \'red\';\n\
                    ctx.strokeStyle = \'red\';\n\
                    ctx.lineWidth = 5;\n\
                    ctx.font = \'100px sans-serif\';\n\
                    ctx.textAlign = \'center\';\n\
                    ctx.fillText(\'2\', canvas.width/2, canvas.height/2);\n\
                    ctx.strokeText(\'2\', canvas.width/2, canvas.height/2);\n\
                    break;\n\
                case 2:\n\
                    ctx.fillStyle = \'red\';\n\
                    ctx.strokeStyle = \'red\';\n\
                    ctx.lineWidth = 5;\n\
                    ctx.font = \'100px sans-serif\';\n\
                    ctx.textAlign = \'center\';\n\
                    ctx.fillText(\'1\', canvas.width/2, canvas.height/2);\n\
                    ctx.strokeText(\'1\', canvas.width/2, canvas.height/2);\n\
                    break;\n\
                case 3:\n\
                    ctx.fillStyle = \'orange\';\n\
                    ctx.strokeStyle = \'orange\';\n\
                    ctx.lineWidth = 5;\n\
                    ctx.font = \'80px sans-serif\';\n\
                    ctx.textAlign = \'center\';\n\
                    ctx.fillText(\'スタート！\', canvas.width/2, canvas.height/2);\n\
                    ctx.strokeText(\'スタート！\', canvas.width/2, canvas.height/2);\n\
                    break;\n\
                case 4:\n\
                    startGame = true;\n\
                    timer = 1;\n\
                    for (let i = 0; i < 4; i++)\n\
                    {\n\
                        stonePos[i][1] = -stonesizeY - (Math.floor(Math.random() * 600) - 10);\n\
                        stonePos[i][0] = Math.floor(Math.random() * (canvas.width + 30)) - 30;\n\
                        stoneHitBox[i][0] = stonePos[i][0] + 10;\n\
                        stoneHitBox[i][1] = stonePos[i][1] + 20;\n\
                        stoneHitBox[i][2] = stonesizeX-20;\n\
                        stoneHitBox[i][3] = stonesizeY-30;\n\
                    }\n\
                    break;\n\
            }\n\
\n\
        }\n\
        if (startGame \&\& !isStop) {\n\
            // console.log(road1XY[0]);\n\
            document.getElementById(\"score\").innerHTML = `Score : ${String(score).padStart(5, \'0\')}`;\n\
            document.getElementById(\"level\").innerHTML = `Level : ${level}`;\n\
            if (xd < 50 \&\& xd > -50) xd = 0;\n\
            if (bd == 1) speed = 2;\n\
            else speed = 1;\n\
            playerVelo = xd * 0.02 * speed;\n\
            if (playerX < ((-canvas.width / 2) + carsizeX / 2)) playerX = (-canvas.width / 2) + carsizeX / 2;\n\
            if (playerX > ((canvas.width / 2) - carsizeX / 2)) playerX = (canvas.width / 2) - carsizeX / 2;\n\
            playerX += playerVelo;\n\
            \n\
            if (!isStop) {\n\
                score++;\n\
                if (timer \% 800 == 0) {\n\
                    level++;\n\
                }\n\
                for (let i = 0; i < 5; i++)\n\
                {\n\
                    grassPos[i][1] += 5 + (level-1) * 0.5;\n\
                    if (grassPos[i][1] > canvas.height) {\n\
                        grassPos[i][1] = -grasssizeY - (Math.floor(Math.random() * canvas.height));\n\
                        grassPos[i][0] = Math.floor(Math.random() * (canvas.width + 30)) - 30;\n\
                    }\n\
                }\n\
                for (let i = 0; i < 4; i++)\n\
                {\n\
                    stonePos[i][1] += 5 + (level-1) * 0.5;\n\
                    if (stonePos[i][1] > canvas.height) {\n\
                        stonePos[i][1] = -stonesizeY - (Math.floor(Math.random() * 1200));\n\
                        stonePos[i][0] = Math.floor(Math.random() * (canvas.width + 30)) - 30;\n\
                        \n\
                    }\n\
                    stoneHitBox[i][0] = stonePos[i][0] + 10;\n\
                    stoneHitBox[i][1] = stonePos[i][1] + 20;\n\
                    stoneHitBox[i][2] = stonesizeX - 20;\n\
                    stoneHitBox[i][3] = stonesizeY - 30;\n\
                }\n\
            }\n\
            \n\
        }\n\
        for (let i = 0; i < 5; i++) {\n\
            ctx.drawImage(grassImage, grassPos[i][0], grassPos[i][1], grasssizeX, grasssizeY);\n\
        }\n\
        for (let i = 0; i < 4; i++) {\n\
            ctx.drawImage(stoneImage, stonePos[i][0], stonePos[i][1], stonesizeX, stonesizeY);\n\
            ctx.fillStyle = \'red\';\n\
            // 石の当たり判定可視化\n\
            // ctx.fillRect(stoneHitBox[i][0], stoneHitBox[i][1], stoneHitBox[i][2], stoneHitBox[i][3]);\n\
        }\n\
\n\
        /*\n\
        [0] = 左\n\
        [0]+[2] = 右\n\
        [1] = 上\n\
        [1]+[3] = 下\n\
        \n\
        */\n\
        \n\
        if (!isStop) {\n\
            for (let i = 0; i < 4; i++) {\n\
                const playerLeft = playerHitBox[0];\n\
                const playerTop = playerHitBox[1];\n\
                const playerRight = playerHitBox[0] + playerHitBox[2];\n\
                const playerBottom = playerHitBox[1] + playerHitBox[3];\n\
    \n\
                const stoneLeft = stoneHitBox[i][0];\n\
                const stoneTop = stoneHitBox[i][1];\n\
                const stoneRight = stoneHitBox[i][0] + stoneHitBox[i][2];\n\
                const stoneBottom = stoneHitBox[i][1] + stoneHitBox[i][3];\n\
    \n\
                if ((playerTop < stoneBottom \&\& stoneTop < playerBottom) \&\& (playerLeft < stoneRight \&\& stoneLeft < playerRight)) {\n\
                    // console.log(\'hit!\');\n\
                    isStop = true;\n\
                    timer = 1;\n\
                    sec = 0;\n\
                    sePlayer.src = bombSE;\n\
                    sePlayer.play();\n\
                    bgmPlayer.pause();\n\
                }\n\
            }\n\
\n\
        }\n\
        else {\n\
            if (timer \% 60 == 0) {\n\
                sec++;\n\
                if (sec == 2) {\n\
                    bgmPlayer.src = gameoverJingle;\n\
                    bgmPlayer.loop = false;\n\
                    bgmPlayer.play();\n\
                }\n\
            }\n\
            // console.log(sec);\n\
            if (sec >= 2) {\n\
                ctx.fillStyle = \'black\';\n\
                ctx.font = \'70px sans-serif\';\n\
                ctx.strokeStyle = \'white\';\n\
                ctx.lineWidth = 6;\n\
                ctx.textAlign = \'center\';\n\
                ctx.strokeText(\'GAME OVER\', canvas.width/2, canvas.height/2);\n\
                ctx.strokeStyle = \'black\';\n\
                ctx.lineWidth = 3;\n\
                ctx.strokeText(\'GAME OVER\', canvas.width/2, canvas.height/2);\n\
                ctx.fillText(\'GAME OVER\', canvas.width/2, canvas.height/2);\n\
            \n\
                ctx.strokeStyle = \'white\';\n\
                ctx.fillStyle = \'red\';\n\
                ctx.font = \'35px sans-serif\';\n\
                ctx.strokeText(\'Bボタン\', canvas.width/2 - 85, canvas.height/2 + 50);\n\
                ctx.fillText(\'Bボタン\', canvas.width/2 - 85, canvas.height/2 + 50);\n\
                ctx.strokeStyle = \'black\';\n\
                ctx.fillStyle = \'white\';\n\
                ctx.strokeText(\'でリトライ\', canvas.width/2 + 70, canvas.height/2 + 50);\n\
                ctx.fillText(\'でリトライ\', canvas.width/2 + 70, canvas.height/2 + 50);\n\
            }\n\
            if (bd == 2) gameReset();\n\
        }\n\
        \n\
        var playerPos = playerX - (carsizeX / 2) + (canvas.width / 2);\n\
        ctx.fillStyle = \'blue\';\n\
        playerHitBox[0] = playerPos + 30;\n\
        playerHitBox[1] = canvas.height - carsizeY + 20;\n\
        playerHitBox[2] = carsizeX - 60;\n\
        playerHitBox[3] = carsizeY - 40;\n\
        ctx.drawImage(carImage, playerPos, canvas.height - carsizeY, carsizeX, carsizeY);\n\
        // プレイヤー当たり判定可視化\n\
        // ctx.fillRect(playerHitBox[0], playerHitBox[1], playerHitBox[2], playerHitBox[3]);\n\
        if (isStop) ctx.drawImage(bombImage, playerPos - 10, canvas.height - carsizeY - 50);\n\
    }\n\
    else {\n\
        ctx.fillStyle = \'white\';\n\
        ctx.fillRect(0, 0, canvas.width, canvas.height);\n\
        ctx.fillStyle = \'darkgreen\';\n\
        ctx.fillRect(0, 0, canvas.width, canvas.height);\n\
        ctx.font = \'20px sans-serif\';\n\
        ctx.fillStyle = \'yellow\';\n\
        ctx.textAlign = \'center\';\n\
        ctx.fillText(\'画面をクリックすると音が鳴るよ！\', canvas.width/2, 100);\n\
        ctx.fillStyle = \'white\';\n\
        ctx.textAlign = \'start\';\n\
        ctx.font = \'30px sans-serif\';\n\
        ctx.fillText(\'遊び方\', 20, 150);\n\
        ctx.font = \'20px sans-serif\';\n\
        ctx.fillText(\'[接続開始]をクリックしよう！\', 20, 190);\n\
        ctx.fillText(\'カウントダウンが終わったら\', 20, 215);\n\
        ctx.fillText(\'ジョイスティックを倒すと車が動く！\', 20, 240);\n\
        ctx.fillStyle = \'lime\';\n\
        ctx.fillText(\'Aボタン\', 20, 265);\n\
        ctx.fillStyle = \'white\';\n\
        ctx.fillText(\'でちょっとだけ車が速くなる！\', 95, 265);\n\
\n\
        ctx.font = \'40px sans-serif\';\n\
        ctx.drawImage(stoneImage, 20, 350, 400 * 0.35 * 0.8, 362 * 0.35 * 0.8);\n\
        ctx.fillText(\'を避けよう！\', 140, 430);\n\
    }\n\
\n\
\n\
    requestAnimationFrame(drawGame);//繰り返し呼び出す\n\
}\n\
drawGame();\n\
\n\
canvas.addEventListener(\"click\", e => {\n\
    if (bgmPlayer.paused \&\& !playingGame) {\n\
        if (!playingGame) {\n\
            bgmPlayer.loop = true;\n\
            bgmPlayer.src = titleBGM;\n\
            bgmPlayer.play();\n\
        }\n\
\n\
    }\n\
});\n\
\n\
function gameReset() {\n\
    const mag = 0.35;\n\
    const grasssizeY = 98 * mag * 0.8;\n\
    const stonesizeX = 400 * mag * 0.5;\n\
    const stonesizeY = 362 * mag * 0.5;\n\
    score = 0;\n\
    timer = 0;\n\
    sec = 0;\n\
    playerX = 0;\n\
    level = 1;\n\
    for (let i = 0; i < 4; i++) {\n\
        stonePos[i][1] = -stonesizeY - (Math.floor(Math.random() * canvas.height) - 10);\n\
        stonePos[i][0] = Math.floor(Math.random() * (canvas.width + 30)) - 30;\n\
        stoneHitBox[i][0] = stonePos[i][0] + 10;\n\
        stoneHitBox[i][1] = stonePos[i][1] + 20;\n\
        stoneHitBox[i][2] = stonesizeX-20;\n\
        stoneHitBox[i][3] = stonesizeY-30;\n\
    }\n\
    for (let i = 0; i < 5; i++) {\n\
        grassPos[i][1] = -grasssizeY + (Math.floor(Math.random() * canvas.height));\n\
        grassPos[i][0] = Math.floor(Math.random() * (canvas.width + 30)) - 30;\n\
    }\n\
    isStop = false;\n\
    startGame = false;\n\
    sePlayer.src = countSE;\n\
    bgmPlayer.pause();\n\
    bgmPlayer.loop = true;\n\
    sePlayer.play();\n\
}\n\
"