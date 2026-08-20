const QRCode = require('qrcode');
QRCode.toFile('C:\\Users\\christian.jusjong\\.gemini\\antigravity\\brain\\d216c80e-801f-4a04-8cdc-0680c862926f\\qr.png', 'exp://192.168.86.135:8081', {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 500,
}, function (err) {
    if (err) throw err;
    console.log('done');
});
