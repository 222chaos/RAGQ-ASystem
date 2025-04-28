import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Space, Tag } from 'antd';
import React, { useState } from 'react';

// 模拟反馈数据
const generateMockFeedback = () => {
  return [
    {
      id: 1,
      content: '系统运行速度较慢，希望能优化性能',
      status: '待处理',
      createTime: '2024-01-01',
    },
    {
      id: 2,
      content: '界面设计很美观，使用体验很好',
      status: '已处理',
      createTime: '2024-01-02',
    },
    {
      id: 3,
      content: '建议添加更多的学习资源',
      status: '待处理',
      createTime: '2024-01-03',
    },
  ];
};

const FeedbackPage: React.FC = () => {
  const [dataSource, setDataSource] = useState(generateMockFeedback());

  const columns = [
    {
      title: '反馈内容',
      dataIndex: 'content',
      key: 'content',
      width: '40%',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === '待处理' ? 'orange' : 'green'}>{status}</Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === '待处理' && (
            <Button type="link" icon={<CheckOutlined />} onClick={() => handleProcess(record)}>
              标记为已处理
            </Button>
          )}
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleProcess = (record: any) => {
    setDataSource(
      dataSource.map((item) => (item.id === record.id ? { ...item, status: '已处理' } : item)),
    );
    message.success('已标记为处理完成');
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条反馈吗？',
      onOk: () => {
        setDataSource(dataSource.filter((item) => item.id !== record.id));
        message.success('删除成功');
      },
    });
  };

  return (
    <div>
      <ProTable
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        search={false}
        pagination={false}
      />
    </div>
  );
};

export default FeedbackPage;
