#include <WiFiS3.h>
#include <ArduinoJson.h>
#include "sha1.h"
#include "base64.h"
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "arduino_secrets.h"
#include "gamepageHTML.h"
#include "gamepageJS.h"
#include "gamepageCSS.h"

#define SCREEN_WIDTH 128  // OLED display width, in pixels
#define SCREEN_HEIGHT 64  // OLED display height, in pixels

// // Declaration for SSD1306 display connected using I2C
#define OLED_RESET -1  // Reset pin # (or -1 if sharing Arduino reset pin)
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

char ssid[] = SECRET_SSID;
char pass[] = SECRET_PASS;

WiFiServer server(80);
WiFiServer serverWS(81);

const int ledPin = 13;
const int buttonA = 5;
const int buttonB = 4;
const int buttonX = 2;
const int buttonY = 3;
const int xPin = A0;  //the VRX attach to
const int yPin = A1;  //the VRY attach to

int buttonState = 0;
int lastButtonState = 0;

void setup() {
  Serial.begin(115200);
  while (!Serial);

  pinMode(ledPin, OUTPUT);
  pinMode(buttonA, INPUT);
  pinMode(buttonB, INPUT);
  pinMode(buttonX, INPUT);
  pinMode(buttonY, INPUT);
  digitalWrite(ledPin, HIGH); 

  // initialize the OLED object
  while (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    for (;;)
      ;
  }

  display.clearDisplay();
  display.setTextSize(1);       // Set text size
  display.setTextColor(WHITE);  // Set text color

  display.setCursor(0, 28);     // Set cursor position
  display.print("Initializing...");
  display.display();

  // check for the presence of the shield:
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue:
    while (true);
  }

  // check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    // don't continue
    while (true);
  }

  String fv = WiFi.firmwareVersion();
  if (fv < WIFI_FIRMWARE_LATEST_VERSION) {
    Serial.println("Please upgrade the firmware");
  }


  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting...");
  }

  server.begin();
  serverWS.begin();
  
}

void loop() {
  WiFiClient client = server.available();
  WiFiClient clientWS = serverWS.available();
  display.clearDisplay();
  display.setTextSize(1);       // Set text size
  display.setTextColor(WHITE);  // Set text color

  display.setCursor(0, 0);     // Set cursor position
  display.println("Initialized!");
  display.println("Local server URL:");
  display.print("http://");
  display.print(WiFi.localIP());
  display.println(":81");
  display.display();

  if (clientWS) {
    Serial.println("new client");           // print a message out the serial port
    String currentLine = "";                // make a String to hold incoming data from the client
    while (clientWS.connected()) {            // loop while the client's connected
      if (clientWS.available()) {             // if there's bytes to read from the client,
        char c = clientWS.read();             // read a byte, then
        // Serial.write(c);                    // print it out to the serial monitor
        if (c == '\n') {                    // if the byte is a newline character

          // if the current line is blank, you got two newline characters in a row.
          // that's the end of the client HTTP request, so send a response:
          if (currentLine.length() == 0) {
            // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
            // and a content-type so the client knows what's coming, then a blank line:
            clientWS.println("HTTP/1.1 200 OK");
            clientWS.println("Content-type:text/html");
            clientWS.println();
            
            // the content of the HTTP response follows the header:
            clientWS.print(HTML_DATA_A);
            clientWS.print(CSS_DATA);
            clientWS.print(HTML_DATA_B);
            clientWS.print(WiFi.localIP());
            clientWS.print(HTML_DATA_C);
            clientWS.print(JS_DATA_A);
            clientWS.print(WiFi.localIP());
            clientWS.print(JS_DATA_B);
            clientWS.print(HTML_DATA_D);

            // The HTTP response ends with another blank line:
            clientWS.println();
            // break out of the while loop:
            break;
          } else {    // if you got a newline, then clear currentLine:
            currentLine = "";
          }
        } else if (c != '\r') {  // if you got anything else but a carriage return character,
          currentLine += c;      // add it to the end of the currentLine
        }
      }
      
    }
    // close the connection:
    clientWS.stop();
    Serial.println("client disconnected");
  }
  if (client) {
    String request = "";
    while (client.connected() && !client.available()) delay(1);
    while (client.available()) {
      char c = client.read();
      request += c;
      if (request.endsWith("\r\n\r\n")) break;
    }

    int keyStart = request.indexOf("Sec-WebSocket-Key: ");
    if (keyStart < 0) return;
    keyStart += 19;
    int keyEnd = request.indexOf("\r\n", keyStart);
    String wsKey = request.substring(keyStart, keyEnd);
    wsKey.trim();

    String magic = wsKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    SHA1 sha1;
    sha1.reset();
    sha1.update((const uint8_t*)magic.c_str(), magic.length());
    uint8_t hash[20];
    sha1.finalize(hash);

    String acceptKey = base64encode(hash, 20);

    client.print("HTTP/1.1 101 Switching Protocols\r\n");
    client.print("Upgrade: websocket\r\n");
    client.print("Connection: Upgrade\r\n");
    client.print("Sec-WebSocket-Accept: " + acceptKey + "\r\n\r\n");

    Serial.println("Handshake complete.");

    // =============================
    // 受信処理（1フレーム、125バイトまで）
    // =============================
    while (client.connected()) {
      if (digitalRead(buttonA) == HIGH) buttonState = 1;
      else if (digitalRead(buttonB) == HIGH) buttonState = 2;
      else if (digitalRead(buttonX) == HIGH) buttonState = 3;
      else if (digitalRead(buttonY) == HIGH) buttonState = 4;
      else {
        buttonState = 0;
      }

      if (buttonState != lastButtonState) {
        lastButtonState = buttonState;
        switch (lastButtonState) {
          case 1:
            pressA();
            break;
          case 2:
            pressB();
            break;
          case 3:
            pressX();
            break;
          case 4:
            pressY();
            break;
          default:
            break;
        }
      }

      const char* reply = createSensorJSON().c_str();
      uint8_t rlen = strlen(reply);
      uint8_t frame[256] = {0};
      if (rlen <= 125) {
        frame[0] = 0x81;  // FIN + text
        frame[1] = rlen;  // no mask
        memcpy(&frame[2], reply, rlen);
        client.write(frame, rlen + 2);
      }
      else {
        frame[0] = 0x81;  // FIN + text
        frame[1] = 126;  // ペイロード長さ切り替え
        frame[3] = rlen & 0xff;  // no mask
        frame[2] = rlen >> 8;  // no mask
        memcpy(&frame[4], reply, rlen);
        client.write(frame, rlen + 4);
      }      
      delay(1);
    }
    client.stop();  // フレーム処理は別途
    Serial.println("Client disconnected.");
  }

}

void pressA()  {
  Serial.println("pressed: A");
  //printOLED("pressed: A", 0, 28);
}

void pressB()  {
  Serial.println("pressed: B");
  //printOLED("pressed: B", 0, 28);
  
}

void pressX()  {
  Serial.println("pressed: X");
  //printOLED("pressed: X", 0, 28);
  
}

void pressY()  {
  Serial.println("pressed: Y");
  //printOLED("pressed: Y", 0, 28);
  
}

String createSensorJSON() {
  // JSONドキュメントを作成（容量を指定）
  StaticJsonDocument<256> doc;

  doc["button"] = lastButtonState;
  doc["X"] = map(analogRead(xPin), 0, 1023, -150, 150);
  doc["Y"] = map(analogRead(yPin), 0, 1023, -150, 150);

  // JSON文字列に変換
  String jsonString;
  serializeJson(doc, jsonString);
  
  return jsonString;
}