import { Button, Checkbox, Dropdown, message, Row, Space } from 'antd';
import React, { useState } from 'react';
import { CopyOutlined, DownloadOutlined, DownOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Modal, Upload, Col, Card, Skeleton } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { apiList, API_KEY, defaultApi, getBase64, isRehandResult, render } from './utlis';

function App() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [currentApi, setCurrentApi] = useState(defaultApi);
  return (
    <Centerer>
      <appComponents.Dropdaun 
        apiList={apiList} 
        currentApi={currentApi} 
        setCurrentApi={setCurrentApi} 
      />
      <Col>
        <FileUploader 
          fileList={fileList}
          setFileList={setFileList}
          currentApi={currentApi}
        />
      </Col>
      <Col style={{ width: '100%'}}>
        {fileList.map((result, index) => 
          <appComponents.ResultCard index={index} result={result} />
        )}
      </Col>
    </Centerer>
  );
}

const appComponents = {
  Dropdaun(props: DropDaunProps) {
    const { apiList, currentApi, setCurrentApi } = props;
    return (
      <Dropdown 
        menu={{ 
          items: apiList.map(api => ({ 
            key: api.label, 
            label: api.label,
            onClick({ key }) {
              const api = apiList.find(api => api.label === key)
              if (api) setCurrentApi(api)
            } 
          }))
        }}
      >
        <Button style={{ marginRight: '0.75rem' }}>
          <a onClick={e => e.preventDefault()}>
            <Space>
              {currentApi.label}
              <DownOutlined />
            </Space>
          </a>
        </Button>
      </Dropdown>
    )
  },
  ResultCard: function(props: ResultCardProps) {
    const { index, result } = props;
    const [showImageText, setShowImageText] = useState(false);
    const [showJSON, setShowJSON] = useState(false);

    const resultTitle = result.status === 'done'
      ? (isRehandResult(result) ? 'V1' : 'V2') + ' ' + result.name
      : 'загрузка...' + result.name
    return(
      <Card 
        type='inner' 
        key={index} 
        title={resultTitle} 
        style={{ width: "100%", marginBottom: '0.75rem' }}
        extra={
          result.status === 'done'
            ? <Space>
              <Button icon={<EyeOutlined />} onClick={e => setShowImageText(true)}>
                Показать текст на изображении
              </Button>
              <Button icon={<DownloadOutlined />} onClick={e => setShowJSON(true)}>
                JSON
              </Button>
            </Space>
            : null
        }
      >
        <appComponents.Modals.JSONPreview 
          result={result}
          showJSON={showJSON}
          setShowJSON={setShowJSON}
          resultTitle={resultTitle}
        />
        <appComponents.Modals.ImagePreview 
          result={result}
          resultTitle={resultTitle}
          showImageText={showImageText}
          setShowImageText={setShowImageText} 
        />
        {result.status === 'done'
          ? isRehandResult(result)
            ? <p>{result.response?.output_text}</p>
            : <p>{result.response?.result?.textAnnotation?.fullText}</p>
          : <Skeleton loading active />
        }
      </Card>
    )
  },
  Modals: {
    ImagePreview({ result, resultTitle, showImageText, setShowImageText }: ImageTextModalProps) {
      const origObj = URL.createObjectURL(result.originFileObj);
      const isYandexApi = !isRehandResult(result);
      const [showBlocks, setShowBlocks] = React.useState(isYandexApi);
      const [showStrings, setShowStrings] = React.useState(isYandexApi);
      const [showWords, setShowWords] = React.useState(true);
      return(
        <Modal
          title={resultTitle} 
          footer={null}
          centered
          open={showImageText}
          onOk={() => setShowImageText(false)}
          onCancel={() => setShowImageText(false)}
          width={1080}
        >
          <Checkbox 
            disabled={!isYandexApi}
            checked={showBlocks} 
            onChange={e => setShowBlocks(e.target.checked)}
          >
            Показать блоки
          </Checkbox>
          <Checkbox 
            disabled={!isYandexApi}
            checked={showStrings} 
            onChange={e => setShowStrings(e.target.checked)}
          >
            Показать строки
            </Checkbox>
          <Checkbox 
            checked={showWords} 
            onChange={e => setShowWords(e.target.checked)}
          >
            Показать слова
            </Checkbox>
          <ScannedPreview 
            file={origObj}
            result={result.response}
            showBlocks={showBlocks}
            showStrings={showStrings}
            showWords={showWords}
          />
        </Modal>
      )
    },
    JSONPreview({ result, resultTitle, showJSON, setShowJSON }: JSONModalProps) {
      return(
        <Modal
          title={resultTitle} 
          footer={null}
          centered
          open={showJSON}
          onOk={() => setShowJSON(false)}
          onCancel={() => setShowJSON(false)}
          width={1000}
          style={{ overflowX: 'scroll' }}
        >
          <Button
            icon={<CopyOutlined />} 
            onClick={function() {
              const text = JSON.stringify(result?.response, null, 2)
              navigator.clipboard.writeText(text)
              message.info('Скопировано')
            }} 
          >
            Копировать
          </Button>
          <pre>{JSON.stringify(result?.response, null, 2)}</pre>
        </Modal>
      )
    },
  }
}

const Centerer = ({ children }: {
  children: React.ReactNode
}) => {
  return(
    <Row
      style={{height: '100vh', padding: '1rem'}}
      justify={'center'}
      align={'top'}
    >
      {children}
    </Row>
  )
}

export default App;





  
const FileUploader: React.FC<fileProps> = ({ fileList, setFileList, currentApi }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} Файл загружен успешно`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} Ошибка загрузки файла`);
    } else if (info.file.percent === 100) {
      message.success(`Идет сканирование...`);
    }
    setFileList(info.fileList);
  }
    

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Добавить фото</div>
    </div>
  );
  return (
    <>
      <Upload 
        action={currentApi.URL}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        headers={{ 'Authorization': API_KEY }}
        progress={{
          strokeColor: {
            '0%': '#108ee9',
            '100%': '#87d068',
          },
          size: 3,
          format: (percent) => 
            percent && (
              percent === 100
                ? 'сканирование...'
                : `${parseFloat(percent.toFixed(2))}%`
            )
        }}
      >
        {fileList.length >= 8 ? null : uploadButton}
      </Upload>
      <Modal 
        open={previewOpen} 
        title={previewTitle} 
        footer={null} 
        onCancel={handleCancel}
      >
        <img 
          alt={previewTitle} 
          title={previewTitle} 
          style={{ width: '100%' }} 
          src={previewImage} 
        />
      </Modal>
    </>
  );
};

const ScannedPreview: React.FC<PreviewProps> = ({ file, result, ...options }) => {
  const [width, setWidth] = React.useState<Optional<number>>(null); 
  const [height, setHeight] = React.useState<Optional<number>>(null);

  const canvasRef = React.useRef<Optional<HTMLCanvasElement>>(null);
  const canvasCtxRef = React.useRef<Optional<CanvasRenderingContext2D>>(null);

  React.useEffect(() => {
    if (canvasRef.current && width && height) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }
    if (canvasRef.current) {
      if (file) {
        canvasCtxRef.current = canvasRef.current.getContext('2d');

        let background = new Image();
        background.src = file;
        background.onload = function () {
          if (canvasCtxRef.current) canvasCtxRef.current.drawImage(background, 0, 0)
          setWidth(background.width);
          setHeight(background.height);
          if ('result' in result) {
            render.fromYandex(result, canvasCtxRef, options)
          } else if ('boxes' in result) {
            render.fromRehand(result, canvasCtxRef, options)
          }
        }
      }


    }
  }, [width, height, file, options.showBlocks, options.showStrings, options.showWords])

  return (
    <canvas ref={canvasRef} style={{ width: '1000px', height: 'auto' }}></canvas>
  )
}