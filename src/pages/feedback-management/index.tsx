import { EyeOutlined } from '@ant-design/icons';
import { Button, Card, Drawer, Rate, Space, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Title, Paragraph, Text } = Typography;

interface Feedback {
  id: number;
  record_id: string;
  subject: string;
  question: string;
  answer: string;
  feedback_type: 'like' | 'dislike';
  feedback_content: string;
  feedback_rating: number;
  created_at: string;
  user_name: string;
  user_type: string;
}

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Feedback | null>(null);

  const columns = [
    {
      title: '用户',
      dataIndex: 'user_name',
      key: 'user_name',
      width: '15%',
    },
    {
      title: '用户类型',
      dataIndex: 'user_type',
      key: 'user_type',
      width: '10%',
      render: (type: string) => (type === 'student' ? '学生' : '教师'),
    },
    {
      title: '科目',
      dataIndex: 'subject',
      key: 'subject',
      width: '15%',
    },
    {
      title: '反馈内容',
      dataIndex: 'feedback_content',
      key: 'feedback_content',
      ellipsis: true,
      width: '30%',
    },
    {
      title: '评分',
      dataIndex: 'feedback_rating',
      key: 'feedback_rating',
      width: '15%',
      render: (rating: number) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      render: (_: any, record: Feedback) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            title="查看详情"
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/feedback');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '获取反馈列表失败');
      }
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error('获取反馈列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record: Feedback) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="反馈管理">
        <Table
          columns={columns}
          dataSource={feedbacks}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Drawer
        title="反馈详情"
        placement="right"
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        width={600}
      >
        {currentRecord && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <Title level={5}>基本信息</Title>
              <Paragraph>
                <Text strong>科目：</Text> {currentRecord.subject}
              </Paragraph>
              <Paragraph>
                <Text strong>用户：</Text> {currentRecord.user_name} (
                {currentRecord.user_type === 'teacher' ? '教师' : '学生'})
              </Paragraph>
              <Paragraph>
                <Text strong>反馈类型：</Text>
                <Tag color={currentRecord.feedback_type === 'like' ? 'success' : 'error'}>
                  {currentRecord.feedback_type === 'like' ? '点赞' : '点踩'}
                </Tag>
              </Paragraph>
              <Paragraph>
                <Text strong>评分：</Text> <Rate disabled value={currentRecord.feedback_rating} />
              </Paragraph>
              <Paragraph>
                <Text strong>反馈内容：</Text> {currentRecord.feedback_content}
              </Paragraph>
              <Paragraph>
                <Text strong>提交时间：</Text> {new Date(currentRecord.created_at).toLocaleString()}
              </Paragraph>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Title level={5}>对话内容</Title>
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <Text strong>问题：</Text>
                <Paragraph style={{ whiteSpace: 'pre-wrap', margin: '8px 0' }}>
                  {currentRecord.question}
                </Paragraph>
              </div>
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                }}
              >
                <Text strong>回答：</Text>
                <Paragraph
                  style={{
                    whiteSpace: 'pre-wrap',
                    margin: '8px 0',
                    maxHeight: '300px',
                    overflow: 'auto',
                  }}
                >
                  {currentRecord.answer || '暂无回答内容'}
                </Paragraph>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
