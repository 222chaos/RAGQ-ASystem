import { Button, Card, Input, Space, Typography } from 'antd';
import { useState } from 'react';

const { Title } = Typography;
const { TextArea } = Input;

export default function TestPage() {
  const [inputText, setInputText] = useState('');
  const [embeddingResult, setEmbeddingResult] = useState('');
  const [loading, setLoading] = useState(false);

  const getEmbedding = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/embedding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEmbeddingResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('向量化失败:', error);
      setEmbeddingResult(`错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Embedding 接口测试</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="请输入要向量化的文本..."
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
          <Button type="primary" onClick={getEmbedding} loading={loading}>
            获取向量
          </Button>
          {embeddingResult && (
            <Card title="向量化结果">
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: '400px',
                  overflow: 'auto',
                  backgroundColor: '#f5f5f5',
                  padding: '16px',
                  borderRadius: '4px',
                }}
              >
                {embeddingResult}
              </pre>
            </Card>
          )}
        </Space>
      </Card>
    </div>
  );
}
