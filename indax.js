var fs = require('fs');
var file = fs.readFileSync('C:/Users/saidlykaov/Downloads/Telegram Desktop/чертежи/40000.jpg');

function saveToTxt(str) {
  fs.appendFile(process.cwd() + '/log.txt', str, () => { });
}

// Получите содержимое файла в формате Base64.
var encoded = Buffer.from(file).toString('base64');
saveToTxt(encoded)
console.log('ready')