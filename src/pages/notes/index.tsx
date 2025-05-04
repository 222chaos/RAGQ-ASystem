import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Modal, Row, Select, Tag, Typography } from 'antd';
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
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [form] = Form.useForm();

  // 加载笔记数据
  useEffect(() => {
    const notes = loadNotesFromLocalStorage();
    setDataSource(notes);
  }, []);

  // 查看和编辑笔记
  const handleViewEdit = (record: Note) => {
    setCurrentNote(record);
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
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalOk = () => {
    form.submit();
  };

  const handleFormSubmit = (values: any) => {
    if (currentNote) {
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
    <div style={{ padding: '20px', maxWidth: '100%' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建笔记
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {dataSource.map((note) => (
          <Col xs={24} sm={12} md={8} lg={6} key={note.id}>
            <Card
              hoverable
              title={
                <div
                  style={{
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {note.title || '无标题'}
                </div>
              }
              extra={
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note);
                  }}
                />
              }
              onClick={() => handleViewEdit(note)}
              style={{ height: '100%' }}
            >
              <div style={{ marginBottom: '8px' }}>
                {note.subject && <Tag color="green">{note.subject}</Tag>}
                {note.category && <Tag color="blue">{note.category}</Tag>}
              </div>
              <div
                style={{
                  color: '#999',
                  fontSize: '12px',
                  marginBottom: '8px',
                }}
              >
                {note.createTime}
              </div>
              <div
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {note.content}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={currentNote ? '查看/编辑笔记' : '新建笔记'}
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
          <Form.Item name="title" label="标题">
            <Input placeholder="请输入笔记标题" />
          </Form.Item>

          <Form.Item name="subject" label="科目">
            <Select placeholder="请选择科目" style={{ width: '100%' }} allowClear>
              <Select.Option value="需求工程">需求工程</Select.Option>
              <Select.Option value="操作系统">操作系统</Select.Option>
              <Select.Option value="计算机网络">计算机网络</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="category" label="分类">
            <Select placeholder="请选择分类" style={{ width: '100%' }} allowClear>
              <Select.Option value="知识点">知识点</Select.Option>
              <Select.Option value="重点难点">重点难点</Select.Option>
              <Select.Option value="考试重点">考试重点</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="content" label="内容">
            <Input.TextArea rows={10} placeholder="请输入笔记内容" style={{ resize: 'vertical' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotesPage;
