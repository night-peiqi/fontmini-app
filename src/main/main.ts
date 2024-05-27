import { app, BrowserWindow, session, Menu } from 'electron'
import path from 'path'
import { updateElectronApp } from 'update-electron-app'
import { registerIpcHandlers } from './ipcHandlers'

let devtools: BrowserWindow | undefined

let mainWindow: BrowserWindow | undefined

const createWindow = () => {
  if (mainWindow) {
    return
  }

  mainWindow = new BrowserWindow({
    width: 800,
    height: 640,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // 加载页面
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)

    // mainWindow.webContents.openDevTools()
    // 开发时 如果碰到打不开开发者工具就使用下面的代码，单独打开一个窗口
    devtools = new BrowserWindow()
    mainWindow.webContents.setDevToolsWebContents(devtools.webContents)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }
}

app.whenReady().then(() => {
  createWindow()
  Menu.setApplicationMenu(null)

  // 设置 Content-Security-Policy（CSP），跨站脚本攻击 (XSS) 和其他代码注入攻击
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["script-src 'self'"]
      }
    })
  })

  // 更新Electron应用
  if (!MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    updateElectronApp()
  }
})

// 在macOS上，当单击dock图标并且没有其他窗口打开时，通常在应用程序中重新创建一个窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 所有窗口关闭时，且不是macOS时退出应用（通常情况下，macOS应用会保持激活状态，直到用户手动退出）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

registerIpcHandlers()
