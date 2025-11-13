const QRCode = require('qrcode');

// APK download URL from EAS build
const apkUrl = 'https://expo.dev/artifacts/eas/iHXwtgdfN3StTEf2myE4kB.apk';

// Generate QR code
QRCode.toFile('hook-apk-qr.png', apkUrl, {
  errorCorrectionLevel: 'H',
  type: 'png',
  quality: 0.95,
  margin: 2,
  width: 500,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
}, function (err) {
  if (err) throw err;
  console.log('✅ QR code generated!');
  console.log('📱 Scan with your phone to download Hook v1.1.0');
  console.log('');
  console.log('🔗 Direct URL:', apkUrl);
});
