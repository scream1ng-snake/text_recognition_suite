
/** "123" */
type NumberStr = string
type YandexWord = {
  boundingBox: { vertices: YandexVertice[] },
  text: string,
  entityIndex: NumberStr,
  textSegments: YandexTextSegment[]
}
type YandexString = {
  boundingBox: {
    vertices: YandexVertice[]
  },
  text: string,
  words: YandexWord[],
  textSegments: YandexTextSegment[]
}
type YandexBlock = {
  boundingBox: {
    vertices: YandexVertice[]
  }
  lines: YandexString[]
  languages: { languageCode: string }[]
  textSegments: YandexTextSegment[]
}

type YandexTextSegment = {
  startIndex: NumberStr
  length: NumberStr
}
type YandexVertice = { x: NumberStr, y: NumberStr }

type YandexResult = {
  result: {
    textAnnotation: {
      width: NumberStr,
      height: NumberStr,
      blocks: YandexBlock[],
      entities: unknown[],
      tables: unknown[],
      fullText: string,
    },
    page: string
  }
}


type RehandBox = {
  confidence: number[],
  h: number,
  text: string,
  w: number,
  x: number,
  y: number,
}

type RehandResult = {
  boxes: RehandBox[],
  output_text: string,
  status: string | 'success',
  text: string,
}
type Result = YandexResult | RehandResult

type BoundingBox = { vertices: YandexVertice[] }
type cordinates = { x: number, y: number, w: number, h: number }

