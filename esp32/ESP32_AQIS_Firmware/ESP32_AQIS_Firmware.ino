#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

const char* WIFI_SSID = "iPhone";
const char* WIFI_PASS = "vipulmane1";
const unsigned long REFRESH_INTERVAL = 2000;

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

#define MQ135_PIN 34
#define DUST_LED_PIN 25
#define DUST_SENSOR_PIN 32

WebServer server(80);
unsigned long lastRefreshTime = 0;

// Global sensor variables
float g_dust = 0;
int g_gas = 0;
float g_temp = 0;
float g_hum = 0;
int g_aqi = 0;

float readDust() {
  digitalWrite(DUST_LED_PIN, LOW);
  delayMicroseconds(280);
  int adc = analogRead(DUST_SENSOR_PIN);
  delayMicroseconds(40);
  digitalWrite(DUST_LED_PIN, HIGH);
  delayMicroseconds(9680);
  float voltage = adc * (3.3 / 4095.0);
  float dust = (voltage - 0.1) * 1000;
  return (dust < 0) ? 0 : dust;
}

int calculateAQI(float pm) {
  if (pm <= 50) return map(pm,0,50,0,50);
  else if (pm <=100) return map(pm,50,100,51,100);
  else if (pm <=200) return map(pm,100,200,101,200);
  else if (pm <=300) return map(pm,200,300,201,300);
  else return map(pm,300,500,301,500);
}

void handleData() {
  StaticJsonDocument<256> doc;
  doc["aqi"] = g_aqi;
  doc["dust"] = g_dust;
  doc["gas"] = g_gas;
  doc["temperature"] = isnan(g_temp) ? 0 : g_temp;
  doc["humidity"] = isnan(g_hum) ? 0 : g_hum;
  doc["lat"] = 18.5204; 
  doc["lon"] = 73.8567;
  
  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);
}

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); 
  
  Serial.begin(115200);
  delay(3000); 
  Serial.println("\n--- EMERGENCY DEBUG BOOT ---");

  Serial.println("Step 1: Sensors Init...");
  pinMode(DUST_LED_PIN, OUTPUT);
  digitalWrite(DUST_LED_PIN, HIGH);
  analogSetAttenuation(ADC_11db);
  dht.begin();
  delay(1000);

  Serial.println("Step 2: Stabilizing Power (3s)...");
  delay(3000); 

  Serial.println("Step 3: Starting WiFi hardware...");
  WiFi.mode(WIFI_STA);
  delay(1000); 
  
  Serial.println("Step 4: Setting Low Power Radio Mode...");
  WiFi.setTxPower(WIFI_POWER_MINUS_1dBm); // Minimum possible power
  delay(1000);

  Serial.print("Step 5: Attempting connection to: ");
  Serial.println(WIFI_SSID);
  
  // Start connection
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 60) {
    delay(500);
    Serial.print(".");
    if (attempts % 10 == 0) {
      Serial.printf("\n[Status: %d] ", WiFi.status());
    }
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nSUCCESS: WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFAILED: WiFi Connection timed out.");
    Serial.println("Please check SSID/Password and ensure your Power Supply is strong.");
    delay(10000);
    ESP.restart();
  }

  server.on("/data", handleData);
  server.begin();
  Serial.println("Final Step: Server is LIVE at /data");
}



void loop() {
  server.handleClient();

  if (millis() - lastRefreshTime > REFRESH_INTERVAL) {
    g_dust = readDust();
    g_gas = analogRead(MQ135_PIN);
    g_temp = dht.readTemperature();
    g_hum  = dht.readHumidity();
    g_aqi = calculateAQI(g_dust);

    Serial.printf("[SENSOR] AQI: %d, Dust: %.1f, Temp: %.1f, Hum: %.1f, Gas: %d\n", 
                  g_aqi, g_dust, g_temp, g_hum, g_gas);

    lastRefreshTime = millis();
  }
}

