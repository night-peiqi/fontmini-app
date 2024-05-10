/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
  saveFile: (file: string) => void
  generateNewFontPackage: (characters: string) => Promise<any>
}

declare global {
  interface Window {
    electronAPI: ElectronApi
  }
}
