import fs from 'fs'
import path from 'path'
import { app, ipcMain, shell } from 'electron'
import Fontmin from 'fontmin'
import rename from 'gulp-rename'
import type { Transform } from 'stream'

type PluginDesc = (...args: any[]) => Transform

const isInvalid = (val: any) => val !== null && val !== undefined

const createStaticPath = (dirName: string) => {
  //
  const userPath = app.getPath('userData')
  const staticPath = path.join(userPath, 'minifont__static', dirName)

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
      }

      const miniFontPackagePath = createStaticPath('mini-font')

      if (!fs.existsSync(miniFontPackagePath)) {
        fs.mkdirSync(miniFontPackagePath, { recursive: true })
      }

      new Fontmin()
        .src(originFontPackagePath)
        .use(
          Fontmin.glyph({
            text: characterString,
            hinting: false
          })
        )
        .use(
          rename(path => {
            path.basename += `-${new Date().getTime()}`
          }) as unknown as PluginDesc
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
