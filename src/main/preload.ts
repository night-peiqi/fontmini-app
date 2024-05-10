import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (filePath: string) => {
    ipcRenderer.send('saveFile', filePath)
  },
  generateNewFontPackage: async (characterString: string) => {
    return ipcRenderer.invoke('generateNewFontPackage', characterString)
  }
})
