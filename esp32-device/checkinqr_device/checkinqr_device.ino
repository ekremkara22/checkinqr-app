#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <qrcode.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define OLED_ADDRESS 0x3C

const char* WIFI_SSID = "FiberHGW_TP3BC0";
const char* WIFI_PASSWORD = "MvnbpEYrdV7j";

const char* API_BASE_URL = "http://192.168.1.104:3000";
const char* DEVICE_SECRET_KEY = "bb0ab39f-f348-4081-8d47-a273a3538882";

const unsigned long WIFI_RETRY_MS = 5000;
const unsigned long SYNC_INTERVAL_MS = 1000;

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

String currentQrToken = "";
String currentDeviceName = "";
unsigned long lastWifiAttemptAt = 0;
unsigned long lastSyncAt = 0;
bool hasRenderedQr = false;

bool isHttpsUrl(const String& url) {
  return url.startsWith("https://");
}

void drawCenteredText(const String& text, int y, int textSize) {
  display.setTextSize(textSize);
  display.setTextColor(SSD1306_WHITE);

  int16_t x1;
  int16_t y1;
  uint16_t width;
  uint16_t height;
  display.getTextBounds(text, 0, y, &x1, &y1, &width, &height);
  int x = (SCREEN_WIDTH - width) / 2;
  display.setCursor(x, y);
  display.print(text);
}

void drawStatusScreen(const String& title, const String& line1 = "", const String& line2 = "") {
  display.clearDisplay();
  drawCenteredText(title, 8, 1);

  if (line1.length() > 0) {
    drawCenteredText(line1, 28, 1);
  }

  if (line2.length() > 0) {
    drawCenteredText(line2, 44, 1);
  }

  display.display();
}

void drawFooterStatus(const String& text) {
  display.fillRect(0, 52, SCREEN_WIDTH, 12, SSD1306_BLACK);
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 54);
  display.print(text);
  display.display();
}

void drawQrCode(const String& token) {
  display.clearDisplay();

  QRCode qrcode;
  uint8_t qrcodeData[qrcode_getBufferSize(4)];
  qrcode_initText(&qrcode, qrcodeData, 4, ECC_LOW, token.c_str());

  const int qrSize = qrcode.size;
  const int scale = 2;
  const int qrPixelSize = qrSize * scale;
  const int xOffset = (SCREEN_WIDTH - qrPixelSize) / 2;
  const int yOffset = 0;

  for (int y = 0; y < qrSize; y++) {
    for (int x = 0; x < qrSize; x++) {
      if (qrcode_getModule(&qrcode, x, y)) {
        display.fillRect(xOffset + (x * scale), yOffset + (y * scale), scale, scale, SSD1306_WHITE);
      }
    }
  }

  display.fillRect(0, 52, SCREEN_WIDTH, 12, SSD1306_BLACK);
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 54);
  display.print(currentDeviceName.length() > 0 ? currentDeviceName : "CheckInQR Device");
  display.display();
  hasRenderedQr = true;
}

void connectWifiIfNeeded() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  unsigned long now = millis();
  if (now - lastWifiAttemptAt < WIFI_RETRY_MS) {
    return;
  }

  lastWifiAttemptAt = now;
  if (!hasRenderedQr) {
    drawStatusScreen("Wi-Fi baglaniliyor", WIFI_SSID);
  } else {
    drawFooterStatus("Wi-Fi baglaniyor");
  }

  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long connectStart = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - connectStart < 12000) {
    delay(300);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Wi-Fi baglandi. IP: ");
    Serial.println(WiFi.localIP());
    if (!hasRenderedQr) {
      drawStatusScreen("Wi-Fi baglandi", WiFi.localIP().toString());
      delay(1000);
    }
  } else {
    Serial.println("Wi-Fi baglantisi kurulamadi.");
    if (!hasRenderedQr) {
      drawStatusScreen("Wi-Fi hatasi", "Baglanti kurulamadi");
    } else {
      drawFooterStatus("Wi-Fi hatasi");
    }
  }
}

bool syncQrToken() {
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }

  String endpoint = String(API_BASE_URL) + "/api/device/qr/sync";
  HTTPClient http;

  WiFiClient client;
  WiFiClientSecure secureClient;

  bool beginOk = false;
  if (isHttpsUrl(endpoint)) {
    secureClient.setInsecure();
    beginOk = http.begin(secureClient, endpoint);
  } else {
    beginOk = http.begin(client, endpoint);
  }

  if (!beginOk) {
    drawStatusScreen("API hatasi", "HTTP baslatilamadi");
    return false;
  }

  http.addHeader("Content-Type", "application/json");
  http.addHeader("Connection", "close");
  http.setTimeout(4000);
  http.setReuse(false);

  StaticJsonDocument<128> requestBody;
  requestBody["secretKey"] = DEVICE_SECRET_KEY;

  String payload;
  serializeJson(requestBody, payload);

  int statusCode = http.POST(payload);
  if (statusCode <= 0) {
    Serial.print("API istegi basarisiz. Kod: ");
    Serial.println(statusCode);
    if (!hasRenderedQr) {
      drawStatusScreen("API hatasi", "Istek gonderilemedi", String(statusCode));
    } else {
      drawFooterStatus("Sync hatasi: " + String(statusCode));
    }
    http.end();
    return false;
  }

  String response = http.getString();
  http.end();

  if (statusCode != 200) {
    Serial.print("HTTP hata kodu: ");
    Serial.println(statusCode);
    if (!hasRenderedQr) {
      drawStatusScreen("Sync hatasi", "HTTP " + String(statusCode));
    } else {
      drawFooterStatus("HTTP " + String(statusCode));
    }
    return false;
  }

  StaticJsonDocument<512> responseJson;
  DeserializationError error = deserializeJson(responseJson, response);
  if (error) {
    Serial.print("JSON parse hatasi: ");
    Serial.println(error.c_str());
    if (!hasRenderedQr) {
      drawStatusScreen("JSON hatasi", error.c_str());
    } else {
      drawFooterStatus("JSON hatasi");
    }
    return false;
  }

  const char* qrToken = responseJson["qrToken"] | "";
  const char* deviceName = responseJson["deviceName"] | "CheckInQR Device";

  currentDeviceName = String(deviceName);

  if (String(qrToken).length() == 0) {
    if (!hasRenderedQr) {
      drawStatusScreen("QR bekleniyor", currentDeviceName);
    } else {
      drawFooterStatus("QR bekleniyor");
    }
    currentQrToken = "";
    return false;
  }

  if (currentQrToken != String(qrToken)) {
    currentQrToken = String(qrToken);
    drawQrCode(currentQrToken);
  } else if (hasRenderedQr) {
    drawFooterStatus(currentDeviceName);
  }

  return true;
}

void setup() {
  Serial.begin(115200);
  delay(300);

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS)) {
    Serial.println("OLED baslatilamadi.");
    while (true) {
      delay(1000);
    }
  }

  display.clearDisplay();
  display.display();

  drawStatusScreen("CheckInQR", "ESP32 basladi");
  delay(1000);

  connectWifiIfNeeded();
}

void loop() {
  connectWifiIfNeeded();

  unsigned long now = millis();
  if (now - lastSyncAt >= SYNC_INTERVAL_MS) {
    lastSyncAt = now;
    syncQrToken();
  }

  delay(50);
}
