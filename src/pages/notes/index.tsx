import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Space, Tag } from 'antd';
import React, { useState } from 'react';

// 模拟笔记数据
const generateMockNotes = () => {
  return [
    {
      id: 1,
      title: '需求工程笔记',
      content: '需求工程是软件开发过程中的重要环节...',
      category: '计算机科学',
      createTime: '2024-01-01',
    },
    {
      id: 2,
      title: '操作系统笔记',
      content: '操作系统是计算机系统的核心软件...',
      category: '计算机科学',
      createTime: '2024-01-02',
    },
    {
      id: 3,
      title: '计算机网络笔记',
      content: '计算机网络是现代信息社会的基础设施...',
      category: '计算机科学',
      createTime: '2024-01-03',
    },
  ];
};

const NotesPage: React.FC = () => {
  const [dataSource, setDataSource] = useState(generateMockNotes());
  const [modalVisible, setModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState<any>(null);

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: '40%',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: any) => {
    setCurrentNote(record);
    setModalVisible(true);
  };

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

  const handleModalOk = () => {
    setModalVisible(false);
    setCurrentNote(null);
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

      <Modal
        title="笔记详情"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          setCurrentNote(null);
        }}
        width={800}
      >
        {currentNote && (
          <div>
            <h3>{currentNote.title}</h3>
            <p>{currentNote.content}</p>
            <Space>
              <Tag color="blue">{currentNote.category}</Tag>
              <span>创建时间：{currentNote.createTime}</span>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NotesPage;
