import fs from 'fs'
import path from 'path'
import { app, ipcMain, shell } from 'electron'
import Fontmin from 'fontmin'

const isInvalid = (val: any) => val !== null && val !== undefined

const createStaticPath = (...dirNames: string[]) => {
  //
  const userPath = app.getPath('userData')
  const staticPath = path.join(userPath, 'minifont__static', ...dirNames)

  if (!fs.existsSync(staticPath)) {
    fs.mkdirSync(staticPath, { recursive: true })
  }

  return staticPath
}

let originFontPackagePath = ''

export const registerIpcHandlers = () => {
  // 保存文件
  ipcMain.on('saveFile', (event, filePath: string) => {
    fs.readFile(filePath, (err, data) => {
      if (isInvalid(err)) {
        console.error('Error reading file', err)
      } else {
        const staticPath = createStaticPath('origin-font')

        originFontPackagePath = path.join(staticPath, path.basename(filePath))

        fs.writeFile(originFontPackagePath, data, err => {
          if (isInvalid(err)) {
            console.error('Error writing file', err)
          } else {
            console.log('File written successfully')
          }
        })
      }
    })
  })

  // 生成新字体包
  ipcMain.handle('generateNewFontPackage', async (event, characterString: string) => {
    return new Promise((resolve, reject) => {
      if (!originFontPackagePath || !characterString) {
        resolve('请上传字体包并填写文字片段')
        return
      }

      const filename = path.parse(originFontPackagePath).name

      const miniFontPackagePath = createStaticPath('mini-font', `${filename}-${new Date().getTime()}`)

      if (!fs.existsSync(miniFontPackagePath)) {
        fs.mkdirSync(miniFontPackagePath, { recursive: true })
      }

      let fontmin = new Fontmin().src(originFontPackagePath)

      if (originFontPackagePath.toLowerCase().endsWith('.ttf')) {
        fontmin = fontmin.use(
          Fontmin.glyph({
            text: characterString,
            hinting: false
          })
        )
      } else if (originFontPackagePath.toLowerCase().endsWith('.otf')) {
        fontmin = fontmin.use(
          Fontmin.otf2ttf({
            text: characterString,
            hinting: false
          })
        )
      }

      fontmin
        .use(
          Fontmin.ttf2woff({
            deflate: true
          })
        )
        .dest(miniFontPackagePath)
        .run(err => {
          setTimeout(() => {
            shell.openPath(miniFontPackagePath)
          }, 500)
          resolve(err)
        })
    })
  })
}
