// Модули для управления приложением и создания окна
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const url = require('url');

let request = require('request');
let fileUpload = require('express-fileupload');
let express = require('express');
let bodyParser = require('body-parser');
let server = express();
let cors = require('cors');
server.use(bodyParser.json())
server.use(cors());
server.use(fileUpload({
  createParentPath: true
}));


server.post('/proxyMe', async function (req, res) {
  try {
    if (!req.files?.file) {
      res.send({
        status: false,
        message: 'Файл отсутствует'
      });
    } else {
      let file = req.files.file;
      let api_key = req.headers["authorization"]
      if(!api_key) {
        res.send({
          status: false,
          message: 'апи_токен отсутствует'
        });
        return;
      }
      let options = {
        uri: 'https://rehand.ru/api/v1/upload',
        method: 'POST',
        headers: {
          'Authorization': api_key,
          'Content-Type': 'multipart/form-data'
        },
        formData: { 
          type: 'handwriting',
          file: {
            value: file.data,
            options: {
              filename: file.name,
              contentType: null
            }
          }
        }
      }
      request(options, function (error, response) {
        if(error) {
          console.error(error);
          res.status(500).send({
            status: false, 
            message: 'Запрос не прошел' + '\n' + error
          });
        }
        const body = JSON.parse(response.body || {})
        if(response && response.statusCode === 200 && body?.status === 'success') {
          res.send(body);
        } else {
          res.send({
            status: false,
            message: 'Не удалось обработать запрос'
          });
          return;
        }
      });
      
    }
  } catch (err) {
    console.error(err)
    debugger
    res.status(500).send(err);
  }
});

// start the server
server.listen(3001);
console.log('Server started! At http://localhost:' + 3001);

function createWindow() {
  // Создаем окно браузера.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // и загрузить index.html приложения.
  //mainWindow.loadFile('index.html')

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(startUrl);
  // mainWindow.loadURL('http://localhost:3000');

  // Отображаем средства разработчика.
  // mainWindow.webContents.openDevTools()
}

// Этот метод вызывается когда приложение инициализируется
// и будет готово для создания окон.
// Некоторые API могут использоваться только после возникновения этого события.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // На MacOS обычно пересоздают окно в приложении,
    // после того, как на иконку в доке нажали и других открытых окон нету.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Выйти когда все окна закрыты
app.on('window-all-closed', function () {
  // Для приложений и строки меню в macOS является обычным делом оставаться
  // активными до тех пор, пока пользователь не выйдет окончательно используя Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

// В этом файле вы можете включить остальную часть основного процесса вашего приложения
//  Вы также можете поместить их в отдельные файлы и подключить через require.