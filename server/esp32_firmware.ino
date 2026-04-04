#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <TinyGPS++.h>
#include <SoftwareSerial.h>

// --- CONFIGURATION ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://YOUR_BACKEND_IP:5000/api/sensor"; // Update with your IP or Render URL
const char* apiKey = "esp32_secret_key_change_me"; // Must match ESP32_API_KEY in .env

// --- SENSOR PINS ---
#define DHTPIN 4
#define DHTTYPE DHT11 // or DHT22
#define MQ135_PIN 34
#define DUST_LED_PIN 2
#define DUST_MEASURE_PIN 35

// --- GPS CONFIG ---
static const int RXPin = 16, TXPin = 17;
static const uint32_t GPSBaud = 9600;

// --- OBJECTS ---
DHT dht(DHTPIN, DHTTYPE);
TinyGPSPlus gps;
HardwareSerial ss(2); // Using Serial2 for GPS (ESP32)

void setup() {
  Serial.begin(115200);
  ss.begin(GPSBaud, SERIAL_8N1, RXPin, TXPin);
  dht.begin();
  pinMode(DUST_LED_PIN, OUTPUT);

  // WiFi Connection
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Read GPS
  while (ss.available() > 0) {
    if (gps.encode(ss.read())) {
      // Data updated
    }
  }

  // Only send data every 10 seconds
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 10000) {
    lastSend = millis();
    sendData();
  }
}

void sendData() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", apiKey);

    // Read Sensors
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int gasRaw = analogRead(MQ135_PIN);
    
    // Simple Dust Reading (approximation)
    digitalWrite(DUST_LED_PIN, LOW);
    delayMicroseconds(280);
    int dustVal = analogRead(DUST_MEASURE_PIN);
    delayMicroseconds(40);
    digitalWrite(DUST_LED_PIN, HIGH);
    delayMicroseconds(9680);
    
    // Location
    double lat = 18.5204; // Fallback to Pune
    double lon = 73.8567;
    if (gps.location.isValid()) {
      lat = gps.location.lat();
      lon = gps.location.lng();
    }

    // Prepare JSON
    StaticJsonDocument<256> doc;
    doc["aqi"] = calculateAQI(gasRaw, dustVal); // Helper function
    doc["dust"] = dustVal / 10.0;
    doc["gas"] = gasRaw;
    doc["temperature"] = t;
    doc["humidity"] = h;
    doc["lat"] = lat;
    doc["lon"] = lon;

    String requestBody;
    serializeJson(doc, requestBody);

    Serial.println("Sending Data: " + requestBody);
    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response code: " + String(httpResponseCode));
      Serial.println(response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }
}

// Simple AQI Mapping (needs calibration for MQ135/Dust)
int calculateAQI(int gas, int dust) {
  // Mock calculation: Normalize values to 0-500 scale
  int aqi = (gas / 20) + (dust / 50);
  if (aqi > 500) aqi = 500;
  return aqi;
}
