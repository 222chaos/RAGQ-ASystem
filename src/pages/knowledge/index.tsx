import { DeleteOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import React, { useState } from 'react';

// 模拟知识库数据
const generateMockKnowledge = () => {
  return [
    {
      id: 1,
      title: '需求工程',
      category: '计算机科学',
      updateTime: '2024-01-01',
    },
    {
      id: 2,
      title: '操作系统',
      category: '计算机科学',
      updateTime: '2024-01-02',
    },
    {
      id: 3,
      title: '计算机网络',
      category: '计算机科学',
      updateTime: '2024-01-03',
    },
  ];
};

const KnowledgePage: React.FC = () => {
  const [dataSource, setDataSource] = useState(generateMockKnowledge());
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    try {
      setUploading(true);
      const response = await fetch('/api/ow', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json();
      message.success('上传成功');
      return data;
    } catch (error) {
      message.error('上传失败');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },

    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
          删除
        </Button>
      ),
    },
  ];

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除"${record.title}"吗？`,
      onOk: () => {
        setDataSource(dataSource.filter((item) => item.id !== record.id));
        message.success('删除成功');
      },
    });
  };

  return (
    <div>
      {/* <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<UploadOutlined />} loading={uploading} onClick={handleUpload}>
          上传文件
        </Button>
      </div> */}
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

export default KnowledgePage;
