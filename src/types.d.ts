type api = { URL: string, label: string, service: 'YANDEX' | 'REHAND' }

type DropDaunProps = {
  apiList: api[],
  currentApi: api,
  setCurrentApi: React.Dispatch<React.SetStateAction<api>>
}
type ResultCardProps = {
  index: number, 
  result: UploadFile<any>
}
type JSONModalProps = {
  resultTitle: string,
  result: UploadFile<any>,
  showJSON: boolean, 
  setShowJSON: React.Dispatch<React.SetStateAction<boolean>>
}
type ImageTextModalProps = {
  resultTitle: string,
  result: UploadFile<any>,
  showImageText: boolean,
  setShowImageText: React.Dispatch<React.SetStateAction<boolean>>
}

type fileProps = {
  setFileList: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
  fileList: UploadFile<any>[]
  currentApi: api
}


type PreviewProps = {
  file: string,
  result: Result
}
type Optional<T> = T | null
type changeEvent = React.ChangeEvent<HTMLInputElement>
type canvasContext = React.MutableRefObject<Optional<CanvasRenderingContext2D>>