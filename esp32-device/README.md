# CheckInQR ESP32 QR Device

Bu klasor, firmanin girisine koyulacak ESP32 + OLED cihazinin ilk firmware taslagini icerir.

## Mimari

ESP32 dogrudan MySQL veritabanina baglanmaz.

Daha dogru akis:

1. ESP32 Wi-Fi'ye baglanir.
2. Sunucudaki `/api/device/qr/sync` endpoint'ine `secretKey` ile POST atar.
3. Sunucu cihaz icin aktif `qrToken` degerini dondurur.
4. ESP32 bu token'i OLED uzerinde QR olarak gosterir.
5. ESP32 duzenli araliklarla endpoint'i tekrar cagirir.
6. Eger sunucudaki token degismisse OLED'deki QR da hemen degisir.

Bu sayede:

- 5 saniyelik token yenileme veritabaninda merkezi olarak yonetilir
- Personel basarili `Giris` veya `Cikis` yaptiginda backend token'i aninda yeniler
- ESP32 bir sonraki poll'da bunu gorup QR'i hemen yeniler

## Dosyalar

- `checkinqr_device.ino`: Arduino IDE / ESP32 icin ana firmware

## Gerekli kutuphaneler

Arduino IDE Library Manager ile su kutuphaneleri kur:

- `Adafruit GFX Library`
- `Adafruit SSD1306`
- `ArduinoJson`
- `QRCode`

## Donanim varsayimi

- Kart: ESP32 Dev Module
- Ekran: SSD1306 128x64 I2C OLED
- I2C adresi: `0x3C`

## Ayarlanacak alanlar

`checkinqr_device.ino` icindeki su degerleri doldur:

- `WIFI_SSID`
- `WIFI_PASSWORD`
- `API_BASE_URL`
- `DEVICE_SECRET_KEY`

## Sunucu endpoint'i

POST `http://<sunucu>/api/device/qr/sync`

Ornek body:

```json
{
  "secretKey": "cihaz-secret-key"
}
```

Ornek cevap:

```json
{
  "deviceId": "uuid",
  "deviceName": "On Kapi ESP32",
  "companyId": "uuid",
  "qrToken": "aktif-uuid-token",
  "qrUpdatedAt": "2026-04-11T12:00:00.000Z",
  "qrExpiresAt": "2026-04-11T12:00:05.000Z",
  "refreshIntervalSeconds": 5
}
```

## Onemli not

Backend tarafinda token 5 saniyede bir degisecek sekilde ayarli.
Ancak personel basarili `Giris` veya `Cikis` yaptiginda token hemen yenileniyor.

Bu nedenle ESP32 kodunda poll araligini 1 saniye tuttuk.
Boylece cihaz, 5 saniyeyi beklemeden yeni token'i hizlica alir.
