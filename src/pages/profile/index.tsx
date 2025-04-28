import { LockOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Form, Input, Modal, Space, Upload, message } from 'antd';
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

        setUserInfo(data);
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
  }, [session, form]);

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

  return (
    <div className={styles.container}>
      <Card title="个人信息" className={styles.card}>
        <div className={styles.avatarSection}>
          <Avatar
            size={120}
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
            <Button
              icon={<UploadOutlined />}
              className={styles.uploadButton}
              loading={uploading || loading}
            >
              {uploading ? '上传中...' : '更换头像'}
            </Button>
          </Upload>
        </div>

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
            <Space style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存修改
              </Button>
              <Button onClick={() => form.resetFields()}>重置</Button>
              <Button type="primary" onClick={() => setPasswordModalVisible(true)}>
                修改密码
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        className={styles.modal}
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
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                确认修改
              </Button>
              <Button
                onClick={() => {
                  setPasswordModalVisible(false);
                  passwordForm.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
