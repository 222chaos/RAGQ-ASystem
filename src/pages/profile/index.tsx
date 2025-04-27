import { LockOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Form, Input, Modal, Space, Upload, message } from 'antd';
import { useState } from 'react';
import styles from './index.module.css';

const { TextArea } = Input;

export default function ProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // TODO: 调用更新个人信息的API
      message.success('个人信息更新成功');
    } catch (error) {
      message.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (values) => {
    try {
      setLoading(true);
      // TODO: 调用修改密码的API
      message.success('密码修改成功');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error('密码修改失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (info) => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }

    if (info.file.status === 'done') {
      try {
        // 这里应该替换为实际的上传API调用
        // const response = await uploadAvatar(info.file.originFileObj);
        // setAvatarUrl(response.url);

        // 临时使用本地预览
        const url = URL.createObjectURL(info.file.originFileObj);
        setAvatarUrl(url);

        // 保存到localStorage
        localStorage.setItem('avatarUrl', url);
      } catch (error) {
        console.error('头像上传失败:', error);
      } finally {
        setUploading(false);
      }
    }

    if (info.file.status === 'error') {
      setUploading(false);
    }
  };

  const customUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
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

      // 创建预览URL
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);

      // 保存到localStorage
      localStorage.setItem('avatarUrl', url);

      // 模拟上传成功
      onSuccess('ok');
      message.success('头像上传成功');
    } catch (error) {
      onError(error);
      message.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card title="个人信息" className={styles.card}>
        <div className={styles.avatarSection}>
          <Avatar size={120} src={avatarUrl} icon={<UserOutlined />} className={styles.avatar} />
          <Upload
            name="avatar"
            listType="picture"
            showUploadList={false}
            customRequest={customUpload}
            onChange={handleAvatarChange}
            disabled={uploading}
          >
            <Button icon={<UploadOutlined />} className={styles.uploadButton} loading={uploading}>
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
            <Space>
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
