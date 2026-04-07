#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ---------------------------------------------------------------- //
// CONFIGURATION
// ---------------------------------------------------------------- //
const char* WIFI_SSID = "admin";
const char* WIFI_PASS = "1234";
const char* SERVER_URL = "https://aqis-backend.onrender.com/api/sensor";
const char* API_KEY = "your_secret_api_key_here";
const unsigned long SEND_INTERVAL = 10000;

// ---------------------------------------------------------------- //
// PIN MAPPING
// ---------------------------------------------------------------- //
#define DHTPIN 4
#define DHTTYPE DHT22
#define MQ135_PIN 34
#define DUST_VO_PIN 32
#define DUST_LED_PIN 25

// OLED Configuration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

DHT dht(DHTPIN, DHTTYPE);
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  delay(2000); // Wait for Serial and Power to stabilize
  Serial.println("\n--- AQIS SYSTEM BOOTING ---");

  // 1. Initialize DHT
  Serial.println("Init DHT22...");
  dht.begin();
  
  // 2. Initialize Dust LED
  pinMode(DUST_LED_PIN, OUTPUT);
  digitalWrite(DUST_LED_PIN, HIGH);

  // 3. Initialize OLED (I2C)
  Serial.println("Init OLED (Pins 21/22)...");
  Wire.begin(21, 22);
  
  // Try 0x3C (Standard) then 0x3D (Alternative)
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
    Serial.println("OLED not found at 0x3C, trying 0x3D...");
    if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) {
      Serial.println("CRITICAL: OLED Allocation failed! Check wiring.");
    }
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0);
  display.println("AQIS ONLINE");
  display.display();
  Serial.println("OLED Status: OK");

  // 4. Connect WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  
  int retry = 0;
  while(WiFi.status() != WL_CONNECTED && retry < 20) {
    delay(500);
    Serial.print(".");
    retry++;
  }

  if(WiFi.status() == WL_CONNECTED) {
    Serial.print("\nWiFi Connected! IP: ");
    Serial.println(WiFi.localIP());
    display.println("WiFi: Connected");
  } else {
    Serial.println("\nWiFi Connection Failed.");
    display.println("WiFi: FAIL");
  }
  display.display();
}

void loop() {
  if (millis() - lastSendTime > SEND_INTERVAL) {
    if (WiFi.status() == WL_CONNECTED) {
      sendSensorData();
    }
    lastSendTime = millis();
  }
}

float getDustDensity() {
  digitalWrite(DUST_LED_PIN, LOW);
  delayMicroseconds(280);
  int voMeasured = analogRead(DUST_VO_PIN);
  delayMicroseconds(40);
  digitalWrite(DUST_LED_PIN, HIGH);
  delayMicroseconds(9680);
  float calcVoltage = voMeasured * (3.3 / 4095.0);
  return 170 * calcVoltage - 0.1;
}

void sendSensorData() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  float dust = getDustDensity();
  int gas = analogRead(MQ135_PIN);
  int aqi = (int)(gas / 4.0) + (int)(dust * 0.5); 
  
  display.clearDisplay();
  display.setCursor(0,0);
  display.printf("AQI: %d\n", aqi);
  display.printf("Temp: %.1fC\n", temperature);
  display.printf("Hum: %.1f%%\n", humidity);
  display.display();

  StaticJsonDocument<256> doc;
  doc["aqi"] = aqi;
  doc["dust"] = dust;
  doc["gas"] = gas;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["lat"] = 18.5204; 
  doc["lon"] = 73.8567;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);
  
  int code = http.POST(jsonPayload);
  Serial.print("Data Push Result: ");
  Serial.println(code);
  http.end();
}
