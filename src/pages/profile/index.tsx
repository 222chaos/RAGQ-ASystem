import {
  EditOutlined,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Space,
  Spin,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styles from './index.module.css';

const { TextArea } = Input;

interface UserInfo {
  id: string;
  username: string;
  type: 'student' | 'teacher';
  avatarUrl: string | null;
  createdAt: string;
  studentId?: string;
  className?: string;
  phone?: string;
  email?: string;
  name?: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [contactForm] = Form.useForm();
  const [contactModalVisible, setContactModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);

        const response = await fetch('/api/profile/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '获取用户信息失败');
        }

        const data = await response.json();

        // 设置头像
        if (data.avatarUrl) {
          setAvatarUrl(data.avatarUrl);
          localStorage.setItem('avatarUrl', data.avatarUrl);
        }

        // 设置表单初始值
        form.setFieldsValue({
          username: data.username,
        });

        // 如果是学生，从 students 表中获取学生信息
        if (session?.user?.type === 'student') {
          const studentResponse = await fetch(
            `/api/profile/student-info?userId=${session.user.id}`,
          );
          if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            // 设置学生信息
            const userInfoData = {
              ...data,
              studentId: studentData.student_id,
              className: studentData.class_name,
              phone: studentData.phone,
              email: studentData.email,
              name: studentData.name,
            };
            setUserInfo(userInfoData);
            // 设置联系方式表单的初始值
            contactForm.setFieldsValue({
              phone: studentData.phone,
              email: studentData.email,
            });
          } else {
            console.error('获取学生信息失败:', await studentResponse.text());
            message.error('获取学生信息失败');
          }
        } else {
          setUserInfo(data);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        message.error({
          content: error instanceof Error ? error.message : '获取用户信息失败',
          duration: 2,
          className: styles.errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [session, form, contactForm]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: values.username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '更新失败');
      }

      const data = await response.json();
      setUserInfo({ ...userInfo!, username: data.username });
      localStorage.setItem('username', data.username);
      window.dispatchEvent(new CustomEvent('usernameUpdated', { detail: data.username }));

      message.success({
        content: '个人信息更新成功',
        duration: 2,
        className: styles.successMessage,
      });
    } catch (error) {
      message.error({
        content: error instanceof Error ? error.message : '更新失败，请重试',
        duration: 2,
        className: styles.errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (values) => {
    try {
      setLoading(true);

      const response = await fetch('/api/profile/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '修改失败');
      }

      message.success({
        content: '密码修改成功',
        duration: 2,
        className: styles.successMessage,
      });
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error('密码修改失败:', error);
      message.error({
        content: error instanceof Error ? error.message : '修改失败，请重试',
        duration: 2,
        className: styles.errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const customUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
      setUploading(true);
      // 检查文件类型
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        throw new Error('只能上传图片文件！');
      }

      // 检查文件大小
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        throw new Error('图片大小不能超过 2MB!');
      }

      // 将文件转换为 Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Url = reader.result as string;

        try {
          // 调用 API 更新数据库中的头像 URL
          const response = await fetch('/api/profile/avatar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ avatarUrl: base64Url }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '上传失败');
          }

          const data = await response.json();
          setAvatarUrl(data.avatarUrl);
          // 更新 localStorage 中的头像
          localStorage.setItem('avatarUrl', data.avatarUrl);
          // 触发自定义事件通知其他组件更新头像
          window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: data.avatarUrl }));

          message.success({
            content: '头像上传成功',
            duration: 2,
            className: styles.successMessage,
          });

          onSuccess('ok');
        } catch (error) {
          onError(error);
          message.error({
            content: error instanceof Error ? error.message : '上传失败',
            duration: 2,
            className: styles.errorMessage,
          });
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = (error) => {
        onError(error);
        setUploading(false);
        message.error({
          content: '文件读取失败',
          duration: 2,
          className: styles.errorMessage,
        });
      };
    } catch (error) {
      onError(error);
      setUploading(false);
      message.error({
        content: error instanceof Error ? error.message : '上传失败',
        duration: 2,
        className: styles.errorMessage,
      });
    }
  };

  const handleContactSubmit = async (values) => {
    try {
      setLoading(true);

      const response = await fetch('/api/profile/update-contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: values.phone,
          email: values.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '更新联系方式失败');
      }

      const data = await response.json();

      setUserInfo({ ...userInfo!, phone: values.phone, email: values.email });
      message.success('联系方式更新成功');
      setContactModalVisible(false);
    } catch (error) {
      console.error('更新联系方式失败:', error);
      message.error(error instanceof Error ? error.message : '更新联系方式失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Card title="个人信息" className={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px', opacity: 0.7 }}>加载用户信息中...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className={styles.container}>
        <Card title="个人信息" className={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Typography.Text type="danger" style={{ fontSize: '16px' }}>
              无法加载用户信息，请刷新页面重试
            </Typography.Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card
        title={
          <Typography.Title level={4} style={{ margin: 0 }}>
            个人信息
          </Typography.Title>
        }
        className={styles.card}
      >
        <div className={styles.avatarSection}>
          <Avatar
            size={140}
            src={avatarUrl || undefined}
            icon={<UserOutlined />}
            className={styles.avatar}
            onError={() => {
              setAvatarUrl(null);
              return false;
            }}
          />
          <Upload
            name="avatar"
            listType="picture"
            showUploadList={false}
            customRequest={customUpload}
            disabled={uploading || loading}
          >
            <Tooltip title="支持jpg、png格式，最大2MB">
              <Button
                icon={<UploadOutlined />}
                className={styles.uploadButton}
                loading={uploading || loading}
              >
                {uploading ? '上传中...' : '更换头像'}
              </Button>
            </Tooltip>
          </Upload>
        </div>

        {session?.user?.type === 'student' ? (
          <div className={styles.studentInfo}>
            <Typography.Title level={4}>学生信息</Typography.Title>
            <Divider style={{ margin: '16px 0 24px' }} />

            <div className={styles.infoItem}>
              <Space>
                <UserOutlined />
                <Typography.Text strong>姓名</Typography.Text>
              </Space>
              <Typography.Text>{userInfo.name || '未设置'}</Typography.Text>
            </div>

            <div className={styles.infoItem}>
              <Space>
                <IdcardOutlined />
                <Typography.Text strong>学号</Typography.Text>
              </Space>
              <Typography.Text>{userInfo.studentId || '未设置'}</Typography.Text>
            </div>

            <div className={styles.infoItem}>
              <Space>
                <TeamOutlined />
                <Typography.Text strong>班级</Typography.Text>
              </Space>
              <Typography.Text>{userInfo.className || '未设置'}</Typography.Text>
            </div>

            <div className={styles.infoItem}>
              <Space>
                <PhoneOutlined />
                <Typography.Text strong>联系电话</Typography.Text>
              </Space>
              <Typography.Text>{userInfo.phone || '未设置'}</Typography.Text>
            </div>

            <div className={styles.infoItem}>
              <Space>
                <MailOutlined />
                <Typography.Text strong>电子邮箱</Typography.Text>
              </Space>
              <Typography.Text>{userInfo.email || '未设置'}</Typography.Text>
            </div>

            <div className={styles.buttonGroup}>
              <Button
                type="primary"
                onClick={() => setContactModalVisible(true)}
                icon={<EditOutlined />}
              >
                修改联系方式
              </Button>
              <Button
                type="primary"
                onClick={() => setPasswordModalVisible(true)}
                icon={<LockOutlined />}
              >
                修改密码
              </Button>
            </div>
          </div>
        ) : (
          <Form form={form} layout="vertical" onFinish={onFinish} className={styles.form}>
            <Form.Item
              label="用户名"
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item>
              <Space
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  marginTop: '16px',
                }}
              >
                <Button type="primary" htmlType="submit" loading={loading} icon={<EditOutlined />}>
                  保存修改
                </Button>
                <Button
                  type="primary"
                  onClick={() => setPasswordModalVisible(true)}
                  icon={<LockOutlined />}
                >
                  修改密码
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Card>

      <Modal
        title={
          <Typography.Title level={4} style={{ margin: 0 }}>
            修改密码
          </Typography.Title>
        }
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        className={styles.modalContent}
        maskClosable={false}
      >
        <Form form={passwordForm} layout="vertical" onFinish={handlePasswordSubmit}>
          <Form.Item
            label="当前密码"
            name="currentPassword"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入当前密码" />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请确认新密码" />
          </Form.Item>

          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Button
                onClick={() => {
                  setPasswordModalVisible(false);
                  passwordForm.resetFields();
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                确认修改
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Typography.Title level={4} style={{ margin: 0 }}>
            修改联系方式
          </Typography.Title>
        }
        open={contactModalVisible}
        onCancel={() => setContactModalVisible(false)}
        footer={null}
        className={styles.modalContent}
        maskClosable={false}
      >
        <Form form={contactForm} onFinish={handleContactSubmit} layout="vertical">
          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入手机号码' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="请输入手机号码" />
          </Form.Item>
          <Form.Item
            name="email"
            label="电子邮箱"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱地址" />
          </Form.Item>
          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Button onClick={() => setContactModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存修改
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
