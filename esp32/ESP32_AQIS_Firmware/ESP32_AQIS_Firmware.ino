#include "BluetoothSerial.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

// ---------------------------------------------------------------- //
// BLUETOOTH CONFIGURATION
// ---------------------------------------------------------------- //
BluetoothSerial SerialBT;
String device_name = "PocketAQI-Sensor";

// ---------- OLED ----------
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// ---------- DHT ----------
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// ---------- MQ135 ----------
#define MQ135_PIN 34

// ---------- GP2Y ----------
#define DUST_LED_PIN 25
#define DUST_SENSOR_PIN 32

// ---------- FUNCTIONS ----------
float readDust() {
  digitalWrite(DUST_LED_PIN, LOW);
  delayMicroseconds(280);
  int adc = analogRead(DUST_SENSOR_PIN);
  delayMicroseconds(40);
  digitalWrite(DUST_LED_PIN, HIGH);
  delayMicroseconds(9680);

  float voltage = adc * (3.3 / 4095.0);
  float dust = (voltage - 0.1) * 1000;
  if (dust < 0) dust = 0;
  return dust;
}

int calculateAQI(float pm) {
  if (pm <= 50) return map(pm,0,50,0,50);
  else if (pm <=100) return map(pm,50,100,51,100);
  else if (pm <=200) return map(pm,100,200,101,200);
  else if (pm <=300) return map(pm,200,300,201,300);
  else return map(pm,300,500,301,500);
}

const char* getLevel(int aqi){
  if(aqi<=50) return "GOOD";
  else if(aqi<=100) return "MOD";
  else if(aqi<=200) return "BAD";
  else if(aqi<=300) return "V.BAD";
  else return "HAZ";
}

// ---------- SETUP ----------
void setup() {
  Serial.begin(115200);
  
  // Initialize Bluetooth
  SerialBT.begin(device_name); 
  Serial.println("Bluetooth Started! Device Name: " + device_name);

  pinMode(DUST_LED_PIN, OUTPUT);
  digitalWrite(DUST_LED_PIN, HIGH);
  analogSetAttenuation(ADC_11db);

  Wire.begin(21,22);
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    while(true);
  }

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0,0);
  display.println("AQIS BLUETOOTH MODE");
  display.println("Waiting for pair...");
  display.display();

  dht.begin();
}

// ---------- LOOP ----------
void loop() {
  float dust = readDust();
  int gas = analogRead(MQ135_PIN);
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();

  int aqi = calculateAQI(dust);
  const char* level = getLevel(aqi);

  // ---- SERIAL (USB) ----
  Serial.print("AQI: "); Serial.print(aqi);
  Serial.print(" | Dust: "); Serial.println(dust);

  // ---- BLUETOOTH SERIAL ----
  if (SerialBT.hasClient()) {
    SerialBT.print("AQI: "); SerialBT.print(aqi);
    SerialBT.print(" ["); SerialBT.print(level); SerialBT.print("]");
    SerialBT.print(" | Temp: "); SerialBT.print(temp);
    SerialBT.print("C | Hum: "); SerialBT.print(hum);
    SerialBT.println("%");
  }

  // ---- OLED DISPLAY ----
  display.clearDisplay();
  
  // AQI Large
  display.setTextSize(3);
  display.setCursor(0,0);
  display.print(aqi);

  // Level status
  display.setTextSize(1);
  display.setCursor(70,10);
  display.print(level);

  display.drawLine(0,35,128,35,SSD1306_WHITE);

  // Metrics Grid
  display.setCursor(0,40);
  display.print("D:"); display.print((int)dust);
  display.print(" T:");
  if(isnan(temp)) display.print("--"); else display.print((int)temp);

  display.setCursor(0,55);
  display.print("G:"); display.print(gas);
  display.print(" H:");
  if(isnan(hum)) display.print("--"); else display.print((int)hum);

  display.display();

  delay(1000); // 1-second refresh for smooth monitoring
}
