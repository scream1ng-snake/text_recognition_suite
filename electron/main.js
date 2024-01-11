// Модули для управления приложением и создания окна
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const url = require('url');

let request = require('request');
let fileUpload = require('express-fileupload');
let express = require('express');
let bodyParser = require('body-parser');
const http = require('http')
// const https = require('https');


let server = express();
let cors = require('cors');
server.use(bodyParser.json())
server.use(cors());
server.use(fileUpload({
  createParentPath: true
}));
const httpServer = http.createServer(server)

const my_oauth_token = 'y0_AgAAAABnJ6UeAATuwQAAAAD2Mtb9EqmSg7CCSjGx70gNB43BCMX__UM'

async function updateIAMtoken() {
  return new Promise(function(resolve, reject) {
    try {
      const options = {
        method: 'POST',
        url: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "yandexPassportOauthToken": my_oauth_token })
      };
      request(options, function(error, response) {
        if (error) {
          console.error(error);
          reject(error)
        }
        if(response && response.statusCode === 200) {
          const body = JSON.parse(response.body || {})
          if(body?.iamToken) {
            resolve(body.iamToken)
            return
          }
          reject(null)
        }
      })
    } catch (err) {
      console.error(err);
      reject(err)
    }
  })
}

let currentIAMtoken = 't1.9euelZqLlJ2Yl5GXjoqclciczpGbze3rnpWayoqYk5OXyIvJiZeQjp6Vyczl8_cub0hT-e84MzVt_t3z924dRlP57zgzNW3-zef1656VmpGPzpONlJLNm4mRjMzGjZDG7_zF656VmpGPzpONlJLNm4mRjMzGjZDG.Si1swxeA2qtJ3QAQDecoUZ61YbtekezYld_bXMx0Ig6MOrGClUMWe7xdvYmOKAcL0Gqfwy8tgen81ugdhnZ_CA'

/** Post query for Reahnd api */
server.post('/proxyMe2', async function (req, res) {
  try {
    if (!req.files?.file) {
      res.status(500).send({
        status: false,
        message: 'Файл отсутствует'
      });
    } else {
      const inputFile = req.files.file.data;
      const encoded = Buffer.from(inputFile).toString('base64');

      let options = {
        method: 'POST',
        url: 'https://ocr.api.cloud.yandex.net/ocr/v1/recognizeText',
        headers: {
          Authorization: 'Bearer ' + currentIAMtoken,
          'Content-Type': 'application/json',
          'x-folder-id': 'b1go1rnknjf12uq4bn22',
          'x-data-logging-enabled': 'true'
        },
        body: JSON.stringify({
          mimeType: "JPEG",
          languageCodes: ["ru"],
          model: "handwritten",
          content: encoded
        })
      }

      request(options, async function (error, response) {
        if (error) {
          console.error(error);
          res.status(500).send({
            status: false,
            message: 'Запрос не выполнен' + '\n' + error
          });
        }
        if (response && response.statusCode === 200) {
          const body = JSON.parse(response.body || {})
          res.send(body)
        } else if(response?.statusCode === 401) {
          const newIAMtoken = await updateIAMtoken()
          currentIAMtoken = newIAMtoken
          options = {
            method: 'POST',
            url: 'https://ocr.api.cloud.yandex.net/ocr/v1/recognizeText',
            headers: {
              Authorization: 'Bearer ' + newIAMtoken,
              'Content-Type': 'application/json',
              'x-folder-id': 'b1go1rnknjf12uq4bn22',
              'x-data-logging-enabled': 'true'
            },
            body: JSON.stringify({
              mimeType: "JPEG",
              languageCodes: ["ru"],
              model: "handwritten",
              content: encoded
            })
          }
          request(options, function(error, response) {
            if (error) {
              console.error(error);
              res.status(500).send({
                status: false,
                message: 'Запрос не выполнен' + '\n' + error
              });
            }
            if (response && response.statusCode === 200) {
              const body = JSON.parse(response.body || {})
              res.send(body)
              return;
            }
            res.status(500).send({
              status: false,
              message: 'Не удалось обработать запрос'
            });
          })
        } else {
          res.status(500).send({
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
})
/** Post query for Rehand api */
server.post('/proxyMe', async function (req, res) {
  try {
    if (!req.files?.file) {
      res.status(500).send({
        status: false,
        message: 'Файл отсутствует'
      });
    } else {
      let file = req.files.file;
      let api_key = req.headers["authorization"]
      if (!api_key) {
        res.status(500).send({
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
        if (error) {
          console.error(error);
          res.status(500).send({
            status: false,
            message: 'Запрос не прошел' + '\n' + error
          });
        }
        const body = JSON.parse(response.body || {})
        if (response && response.statusCode === 200 && body?.status === 'success') {
          res.send(body);
        } else {
          res.status(500).send({
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
httpServer.listen(5556, () => {
  console.log('Server started! At http://localhost:' + 5556)
});

function createWindow() {
  // Создаем окно браузера.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    }
  })
  mainWindow.maximize();
  mainWindow.show();
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