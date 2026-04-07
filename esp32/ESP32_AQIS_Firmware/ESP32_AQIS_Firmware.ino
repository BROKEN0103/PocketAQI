#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ---------------------------------------------------------------- //
// CONFIGURATION
// ---------------------------------------------------------------- //
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// Backend Server details
// Example: "http://192.168.1.100:5000/api/sensor" (Local Testing)
// Example: "https://aqis-backend.onrender.com/api/sensor" (Cloud Production)
const char* SERVER_URL = "https://aqis-backend.onrender.com/api/sensor";

// Match this with ESP32_API_KEY in backend .env
const char* API_KEY = "your_secret_api_key_here";

// Time interval to send data (in milliseconds)
const unsigned long SEND_INTERVAL = 10000; // 10 seconds

unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  
  // Initialize Sensors (Replace with real initialization)
  // ...
  
  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to WiFi");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected.");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (millis() - lastSendTime > SEND_INTERVAL) {
    if (WiFi.status() == WL_CONNECTED) {
      sendSensorData();
    } else {
      Serial.println("WiFi Disconnected. Reconnecting...");
      WiFi.reconnect();
    }
    lastSendTime = millis();
  }
}

void sendSensorData() {
  // 1. Read real sensors here (Placeholder values used currently)
  float temperature = 24.5 + random(-20, 20) / 10.0;
  float humidity = 45.0 + random(-50, 50) / 10.0;
  int aqi = 150 + random(-30, 30);
  int dust = 50 + random(-10, 10);
  int gas = 400 + random(-50, 50);
  
  // GPS Location (Replace with TinyGPS++ data if using real GPS)
  float lat = 18.5204; // Pune
  float lon = 73.8567; // Pune

  // 2. Prepare JSON Payload
  StaticJsonDocument<200> doc;
  doc["aqi"] = aqi;
  doc["dust"] = dust;
  doc["gas"] = gas;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["lat"] = lat;
  doc["lon"] = lon;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // 3. Send HTTP POST Request
  HTTPClient http;
  http.begin(SERVER_URL);
  
  // Headers
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);

  Serial.println("Sending data to " + String(SERVER_URL));
  Serial.println("Payload: " + jsonPayload);

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    Serial.println("Response payload: " + response);
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
    Serial.println(http.errorToString(httpResponseCode).c_str());
  }
  
  http.end(); // Free resources
}
