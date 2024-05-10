import type { UploadFile, UploadRawFile } from 'element-plus'

interface IUploadRawFile extends UploadRawFile {
  path: string
}

export interface IUploadFile extends UploadFile {
  raw: IUploadRawFile
}
