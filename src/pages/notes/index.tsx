import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, message, Modal, Select, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Title, Paragraph } = Typography;

// 笔记数据接口
interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  subject: string;
  createTime: string;
}

// 从本地存储加载笔记
const loadNotesFromLocalStorage = (): Note[] => {
  try {
    const notes = localStorage.getItem('chat_notes');
    return notes ? JSON.parse(notes) : [];
  } catch (error) {
    console.error('加载笔记失败:', error);
    return [];
  }
};

// 保存笔记到本地存储
const saveNotesToLocalStorage = (notes: Note[]) => {
  try {
    localStorage.setItem('chat_notes', JSON.stringify(notes));
  } catch (error) {
    console.error('保存笔记失败:', error);
  }
};

const NotesPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<Note[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [form] = Form.useForm();

  // 加载笔记数据
  useEffect(() => {
    const notes = loadNotesFromLocalStorage();
    setDataSource(notes);
  }, []);

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: '25%',
      ellipsis: true,
    },
    {
      title: '科目',
      dataIndex: 'subject',
      key: 'subject',
      width: '15%',
      ellipsis: true,
      render: (subject: string) => <Tag color="green">{subject}</Tag>,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: '15%',
      ellipsis: true,
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: '20%',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: '25%',
      render: (_, record: Note) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  // 预览笔记
  const handlePreview = (record: Note) => {
    setCurrentNote(record);
    setPreviewVisible(true);
  };

  const handleEdit = (record: Note) => {
    setCurrentNote(record);
    setEditMode(true);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (record: Note) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除"${record.title}"吗？`,
      onOk: () => {
        const newDataSource = dataSource.filter((item) => item.id !== record.id);
        setDataSource(newDataSource);
        saveNotesToLocalStorage(newDataSource);
        message.success('删除成功');
      },
    });
  };

  const handleCreate = () => {
    setCurrentNote(null);
    setEditMode(false);
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalOk = () => {
    form.submit();
  };

  const handleFormSubmit = (values: any) => {
    if (editMode && currentNote) {
      // 更新笔记
      const updatedNote = {
        ...currentNote,
        ...values,
      };
      const newDataSource = dataSource.map((item) =>
        item.id === currentNote.id ? updatedNote : item,
      );
      setDataSource(newDataSource);
      saveNotesToLocalStorage(newDataSource);
      message.success('笔记更新成功');
    } else {
      // 创建新笔记
      const newNote: Note = {
        id: Date.now().toString(),
        ...values,
        createTime: new Date().toLocaleString(),
      };
      const newDataSource = [...dataSource, newNote];
      setDataSource(newDataSource);
      saveNotesToLocalStorage(newDataSource);
      message.success('笔记创建成功');
    }
    setModalVisible(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '100%', overflowX: 'hidden' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建笔记
        </Button>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <ProTable
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          search={false}
          pagination={{ pageSize: 10 }}
          toolBarRender={false}
          scroll={{ x: 'max-content' }}
          style={{ width: '100%' }}
        />
      </div>

      <Modal
        title={editMode ? '编辑笔记' : '新建笔记'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={800}
        destroyOnClose
        style={{ maxWidth: '95vw' }}
        bodyStyle={{ overflowY: 'auto', maxHeight: 'calc(90vh - 200px)' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={currentNote || {}}
          style={{ width: '100%' }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入笔记标题' }]}
          >
            <Input placeholder="请输入笔记标题" />
          </Form.Item>

          <Form.Item
            name="subject"
            label="科目"
            rules={[{ required: true, message: '请选择科目' }]}
          >
            <Select placeholder="请选择科目" style={{ width: '100%' }}>
              <Select.Option value="需求工程">需求工程</Select.Option>
              <Select.Option value="操作系统">操作系统</Select.Option>
              <Select.Option value="计算机网络">计算机网络</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类" style={{ width: '100%' }}>
              <Select.Option value="知识点">知识点</Select.Option>
              <Select.Option value="重点难点">重点难点</Select.Option>
              <Select.Option value="考试重点">考试重点</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入笔记内容' }]}
          >
            <Input.TextArea rows={10} placeholder="请输入笔记内容" style={{ resize: 'vertical' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="笔记详情"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
        style={{ maxWidth: '95vw' }}
        bodyStyle={{ overflowY: 'auto', maxHeight: 'calc(90vh - 200px)' }}
      >
        {currentNote && (
          <div>
            <Title level={4}>{currentNote.title}</Title>
            <div style={{ margin: '12px 0' }}>
              <Space>
                <Tag color="green">{currentNote.subject}</Tag>
                <Tag color="blue">{currentNote.category}</Tag>
                <span style={{ color: '#999' }}>{currentNote.createTime}</span>
              </Space>
            </div>
            <Paragraph style={{ whiteSpace: 'pre-wrap', marginTop: '16px' }}>
              {currentNote.content}
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NotesPage;
