# define HTML_DATA_A "\
<!DOCTYPE html>\n\
<html lang=\"ja\">\n\
    <head>\n\
        <meta charset=\"UTF-8\">\n\
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n\
        <title>ドライブゲーム</title>\n\
        <style>\n"
# define HTML_DATA_B "\
</style>\n\
    <body>\n\
        <!--div hidden>Hello World!</div-->\n\
        <div class=\"header\">ドライブゲーム</div>\n\
        <br>\n\
        <div id=\"gameview\" class=\"gameview\">\n\
            <canvas id=\"view\" class=\"view\" width=\"400\" height=\"600\"></canvas>\n\
            <div class=\"score\">\n\
                <p id=\"score\" style=\"font-family: 'Arial black';\">Score : 00000</p>\n\
                <p id=\"level\" style=\"font-family: 'Arial black';\">Level : 1</p>\n\
                <p id=\"highscore\" style=\"font-family: 'Arial black';\">High score : 00000</p>\n\
                <p id=\"highlevel\" style=\"font-family: 'Arial black';\">High level : 1</p>\n\
                <p id=\"pxd\" hidden>xd : 0</p>\n\
                \n\
                <div id=\"connectview\" class=\"connectview\">\n\
                    <br>\n\
                    <p>接続先: <span id=\"serverUrl\">ws://\
"

#define HTML_DATA_C "\
:80</span></p>\n\
                    <p>状態: <span id=\"status\">切断中</span></p>\n\
                    \
                    <button id=\"connectBtn\">接続開始</button>\n\
                </div>\n\
            </div>\n\
        </div>\n\
        <script>\n"
#define HTML_DATA_D "\
</script>\n\
    </body>\n\
</html>\n\
"