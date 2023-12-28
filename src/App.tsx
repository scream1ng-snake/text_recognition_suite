import { message, Row } from 'antd';
import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload, Col, Card, Skeleton } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';

const API_KEY = 'dccee4ca-1d81-420e-bc53-8863167dce0e'

function App() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  return (
    <Centerer>
      <Col>
        <FileUploader 
          fileList={fileList}
          setFileList={setFileList}
        />
      </Col>
      <Col style={{ width: '100%'}}>
        {fileList.map((result, index) => 
          <Card type='inner' key={index} title={result.name} style={{ width: "100%", marginBottom: '0.75rem' }}>
            {result.status === 'done'
              ? <p>{result.response?.output_text}</p>
              : <Skeleton loading active />
            }
          </Card>
        )}
      </Col>
    </Centerer>
  );
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




function getBase64(file: RcFile): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
  
type fileProps = {
  setFileList: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
  fileList: UploadFile<any>[]
}
const FileUploader: React.FC<fileProps> = ({ fileList, setFileList }) => {
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
        action={'http://localhost:3001/proxyMe'}
        // action={'https://rehand.ru/api/v1/upload'}
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

