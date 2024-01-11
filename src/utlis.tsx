import { UploadFile } from "antd"
import { RcFile } from "antd/es/upload"

/** rehand Api key */
export const API_KEY = 'dccee4ca-1d81-420e-bc53-8863167dce0e'

export const apiList: api[] = [
  { URL: 'http://localhost:5556/proxyMe2', label: 'V2', service: 'YANDEX' },
  { URL: 'http://localhost:5556/proxyMe', label: 'V1', service: 'REHAND' }
]
export const defaultApi: api = apiList[0]
export function isRehandResult(result: UploadFile<any>) {
  return result?.xhr?.responseURL === apiList[1].URL
}

export const render = {
  fromYandex(result: YandexResult, context: canvasContext) {
    const blocks = result.result.textAnnotation.blocks;

    
    function getCordinates({ vertices }: BoundingBox): cordinates {
      const { x, y } = vertices[0];
      const h = Number(vertices[1].y) - Number(y);
      const w = Number(vertices[3].x) - Number(x);
      return { x: Number(x), y: Number(y), h, w }
    }
    function renderBlocks(blocks: YandexBlock[]) {
      for (const block of blocks) {
        if (context.current) {
          const { x, y, w, h } = getCordinates(block.boundingBox)
          context.current.lineWidth = 4;
          context.current.strokeStyle = 'blue';
          context.current.fillStyle = 'rgba(0,0,0,0.5)';
          context.current.strokeRect(x, y, w, h)
        }
        renderStrings(block.lines)
      }
    }
    function renderStrings(lines: YandexString[]) {
      for (const line of lines) {
        if (context.current) {
          const { x, y, w, h } = getCordinates(line.boundingBox)
          context.current.lineWidth = 4;
          context.current.strokeStyle = 'yellow';
          context.current.fillStyle = 'rgba(0,0,0,0.5)';
          context.current.strokeRect(x, y, w, h)
        }
        renderWords(line.words)
      }
    }
    function renderWords(words: YandexWord[]) {
      if(context.current) {
        for (const word of words) {
          const { x, y, w, h } = getCordinates(word.boundingBox)
          context.current.lineWidth = 4;
          context.current.strokeStyle = 'red';
          context.current.fillStyle = 'rgba(0,0,0,0.5)';
          context.current.strokeRect(x, y, w, h)
        }
      }
    }
    
    renderBlocks(blocks);
  },
  fromRehand(result: RehandResult, context: canvasContext) {
    for (const { x, y, w, h } of result.boxes) {
      if (context.current) {
        context.current.lineWidth = 4
        context.current.strokeStyle = 'red'
        context.current.fillStyle = 'rgba(0,0,0,0.5)'
        context.current.strokeRect(x, y, w, h)
      }
    }
  },
}

export function getBase64(file: RcFile): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}