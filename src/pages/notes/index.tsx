import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Modal, Row, Select, Tag, Typography } from 'antd';
import { useSession } from 'next-auth/react';
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
  userId: string; // 添加用户ID字段
}

// 从本地存储加载笔记
const loadNotesFromLocalStorage = (userId: string): Note[] => {
  try {
    const notes = localStorage.getItem(`chat_notes_${userId}`);
    return notes ? JSON.parse(notes) : [];
  } catch (error) {
    console.error('加载笔记失败:', error);
    return [];
  }
};

// 保存笔记到本地存储
const saveNotesToLocalStorage = (notes: Note[], userId: string) => {
  try {
    localStorage.setItem(`chat_notes_${userId}`, JSON.stringify(notes));
  } catch (error) {
    console.error('保存笔记失败:', error);
  }
};

const NotesPage: React.FC = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id || '';
  const [dataSource, setDataSource] = useState<Note[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [form] = Form.useForm();

  // 加载笔记数据
  useEffect(() => {
    if (userId) {
      const notes = loadNotesFromLocalStorage(userId);
      setDataSource(notes);
    }
  }, [userId]);

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
        saveNotesToLocalStorage(newDataSource, userId);
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
    if (!userId) {
      message.error('用户未登录，无法保存笔记');
      return;
    }

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
      saveNotesToLocalStorage(newDataSource, userId);
      message.success('笔记更新成功');
    } else {
      // 创建新笔记
      const newNote: Note = {
        id: Date.now().toString(),
        ...values,
        createTime: new Date().toLocaleString(),
        userId: userId, // 添加用户ID
      };
      const newDataSource = [...dataSource, newNote];
      setDataSource(newDataSource);
      saveNotesToLocalStorage(newDataSource, userId);
      message.success('笔记创建成功');
    }
    setModalVisible(false);
  };

  // 如果用户未登录，显示提示信息
  if (!userId) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Typography.Title level={4}>请先登录后再查看笔记</Typography.Title>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '100%' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建笔记
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {dataSource.length === 0 ? (
          <Col span={24}>
            <Card style={{ textAlign: 'center', padding: '30px 0' }}>
              <div>
                <img
                  src="/images/empty-notes.svg"
                  alt="空笔记"
                  style={{ width: '120px', height: '120px', marginBottom: '20px' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <Title level={4}>暂无笔记</Title>
                <Paragraph>
                  您可以在智能问答过程中点击聊天窗口右下角的笔记按钮记录重要内容
                </Paragraph>
                <Paragraph>或者直接点击右上角的"新建笔记"按钮创建一个新笔记</Paragraph>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                  style={{ marginTop: '15px' }}
                >
                  立即创建笔记
                </Button>
              </div>
            </Card>
          </Col>
        ) : (
          dataSource.map((note) => (
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
          ))
        )}
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
