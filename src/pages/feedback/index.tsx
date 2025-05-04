import { EyeOutlined, UndoOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button, Drawer, message, Modal, Rate, Space, Tag, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

const { Title, Paragraph, Text } = Typography;

// 定义反馈数据接口
interface FeedbackRecord {
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

const FeedbackPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<FeedbackRecord | null>(null);
  const actionRef = useRef<any>();

  // 获取反馈列表
  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/feedback/get-list');
      if (response.ok) {
        const data = await response.json();
        setDataSource(data.data || []);
        // 如果actionRef存在，刷新表格
        if (actionRef.current) {
          actionRef.current.reload();
        }
      } else {
        message.error('获取反馈列表失败');
      }
    } catch (error) {
      console.error('获取反馈列表失败:', error);
      message.error('获取反馈列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 查看详情
  const handleViewDetail = (record: FeedbackRecord) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  // 撤销反馈
  const handleReset = (record: FeedbackRecord) => {
    Modal.confirm({
      title: '确认撤销',
      content: '确定要撤销这条反馈吗？',
      onOk: async () => {
        try {
          const response = await fetch('/api/feedback/reset', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recordId: record.record_id,
            }),
          });

          if (!response.ok) {
            throw new Error('撤销失败');
          }

          message.success('撤销成功');
          // 刷新列表
          if (actionRef.current) {
            actionRef.current.reload();
          } else {
            fetchFeedbacks();
          }
        } catch (error) {
          console.error('撤销反馈失败:', error);
          message.error('撤销反馈失败');
        }
      },
    });
  };

  // 删除反馈记录
  const handleDelete = (record: FeedbackRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条反馈记录吗？这将删除整条聊天记录！',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // 这里应该调用删除API（如果有的话）
          // 此处只是模拟操作
          setDataSource(dataSource.filter((item) => item.id !== record.id));
          message.success('删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 组件加载时获取数据
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const columns = [
    {
      title: '科目',
      dataIndex: 'subject',
      key: 'subject',
      width: '15%',
    },
    {
      title: '反馈类型',
      dataIndex: 'feedback_type',
      key: 'feedback_type',
      width: '10%',
      render: (type: string) => (
        <Tag color={type === 'like' ? 'success' : 'error'}>{type === 'like' ? '点赞' : '点踩'}</Tag>
      ),
    },
    {
      title: '反馈内容',
      dataIndex: 'feedback_content',
      key: 'feedback_content',
      ellipsis: true,
      width: '40%',
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
      width: '20%',
      render: (_: any, record: FeedbackRecord) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            title="查看详情"
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<UndoOutlined />}
            onClick={() => handleReset(record)}
            title="撤销反馈"
          >
            撤销
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <ProTable
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        search={false}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        dateFormatter="string"
        headerTitle="我的反馈"
        options={{
          reload: () => {
            fetchFeedbacks();
          },
          setting: true,
          density: true,
        }}
        actionRef={actionRef}
      />

      {/* 详情抽屉 */}
      <Drawer
        title="反馈详情"
        placement="right"
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        width={600}
        extra={
          <Button type="primary" danger onClick={() => currentRecord && handleReset(currentRecord)}>
            撤销反馈
          </Button>
        }
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
};

export default FeedbackPage;
