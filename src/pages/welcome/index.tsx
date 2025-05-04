import {
  BulbOutlined,
  ChromeOutlined,
  RightCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Divider, Row, Space, Typography, theme } from 'antd';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from './index.module.css';

const { Title, Paragraph, Text } = Typography;

// 功能图标映射
const featureIcons = {
  学生管理: <ChromeOutlined style={{ fontSize: '24px', color: '#1677ff' }} />,
  发布练习: <BulbOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
  智能问答: <RocketOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
  我的笔记: <BulbOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
  个性化分析: <ChromeOutlined style={{ fontSize: '24px', color: '#eb2f96' }} />,
  我的练习: <BulbOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />,
  我的反馈: <RocketOutlined style={{ fontSize: '24px', color: '#1677ff' }} />,
};

export default function WelcomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [userType, setUserType] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const { token } = theme.useToken();
  const [animationTrigger, setAnimationTrigger] = useState(false);

  useEffect(() => {
    // 确保在客户端环境中执行localStorage操作
    if (typeof window !== 'undefined') {
      // 从会话或本地存储获取用户类型
      const type = session?.user?.type || localStorage.getItem('userType') || 'student';
      setUserType(type);

      // 获取用户名
      const name = localStorage.getItem('username') || '';
      setUsername(name);

      // 触发动画
      setTimeout(() => {
        setAnimationTrigger(true);
      }, 100);
    }
  }, [session]);

  // 根据用户类型返回不同的功能列表
  const getFeaturesByUserType = () => {
    if (userType === 'teacher') {
      return [
        { title: '学生管理', desc: '添加和管理学生账号，查看学生基本信息', path: '/student' },
        {
          title: '发布练习',
          desc: '创建和管理不同难度的练习，设置截止时间并跟踪完成情况',
          path: '/exercise-management',
        },
        { title: '智能问答', desc: '选择不同学科领域，获取RAG技术支持的专业答案', path: '/qa' },
        { title: '我的笔记', desc: '创建、编辑和管理个人笔记，记录教学要点', path: '/notes' },
        { title: '个性化分析', desc: '查看教学数据分析，了解学生整体学习情况', path: '/analysis' },
      ];
    } else {
      return [
        { title: '智能问答', desc: '选择学科领域，提问专业问题并获取详细解答', path: '/qa' },
        { title: '我的笔记', desc: '记录和管理重要学习内容，支持分类和标签', path: '/notes' },
        {
          title: '我的练习',
          desc: '查看并完成教师布置的练习，按难度和科目分类',
          path: '/exercises',
        },
        {
          title: '个性化分析',
          desc: '查看个人学习情况和表现数据，获取提升建议',
          path: '/analysis',
        },
        { title: '我的反馈', desc: '提交使用反馈和问题报告，查看反馈处理状态', path: '/feedback' },
      ];
    }
  };

  const features = getFeaturesByUserType();

  return (
    <div className={styles.container}>
      <div className={styles.welcomeBanner} style={{ background: token.colorBgContainer }}>
        <Title level={2}>
          欢迎使用
          <span className={styles.brandName}>帮你读</span>
        </Title>
        <Paragraph className={styles.description}>
          基于RAG技术的智能教育辅助系统，为{userType === 'teacher' ? '教师教学' : '学生学习'}
          提供全方位支持
        </Paragraph>
        <Divider className={styles.divider} />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.sectionTitle}>
          <Title level={3}>
            快速入口
            <RocketOutlined style={{ marginLeft: '8px', color: '#1677ff' }} />
          </Title>
          <Text type="secondary">
            选择以下功能模块，开始{userType === 'teacher' ? '教学' : '学习'}之旅
          </Text>
        </div>

        <Row gutter={[24, 24]} className={styles.featureCards}>
          {features.map((feature, index) => (
            <Col
              xs={24}
              sm={12}
              md={8}
              key={index}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <Card
                hoverable
                className={styles.featureCard}
                onClick={() => router.push(feature.path)}
              >
                <div className={styles.featureContent}>
                  <div style={{ marginBottom: '16px' }}>{featureIcons[feature.title]}</div>
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph className={styles.featureDesc}>{feature.desc}</Paragraph>
                </div>
                <div className={styles.featureAction}>
                  <Button type="primary">
                    进入
                    <RightCircleOutlined />
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div className={styles.quickStart}>
          <Card className={styles.quickStartCard}>
            <Row gutter={[24, 0]} align="middle">
              <Col xs={24} md={16}>
                <Title level={4}>
                  {userType === 'teacher' ? '开始创建教学内容' : '开始智能学习体验'}
                  <RocketOutlined
                    style={{ marginLeft: '8px', fontSize: '24px', color: '#1677ff' }}
                  />
                </Title>
                <Paragraph>
                  {userType === 'teacher'
                    ? '通过智能问答辅助备课，或发布练习检验学生学习效果'
                    : '选择感兴趣的学科，提出问题，获取基于知识库的精准解答'}
                </Paragraph>
              </Col>
              <Col xs={24} md={8} className={styles.quickStartAction}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Space size="middle">
                    <Button type="primary" size="large" onClick={() => router.push('/qa')}>
                      智能问答
                      <RightCircleOutlined />
                    </Button>
                    {userType === 'teacher' ? (
                      <Button size="large" onClick={() => router.push('/exercise-management')}>
                        发布练习
                        <RightCircleOutlined />
                      </Button>
                    ) : (
                      <Button size="large" onClick={() => router.push('/exercises')}>
                        查看练习
                        <RightCircleOutlined />
                      </Button>
                    )}
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </div>

      {userType === 'student' && (
        <div className={styles.tipsSection}>
          <Card
            className={styles.tipsCard}
            title={
              <div>
                <BulbOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                学习小贴士
              </div>
            }
          >
            <ul className={styles.tipsList}>
              <li>使用智能问答模块解决学习中的疑难问题，支持多个学科领域</li>
              <li>完成老师布置的练习，注意练习的截止时间和难度标识</li>
              <li>养成做笔记的习惯，对重要知识点进行标记和整理</li>
              <li>查看个性化分析报告，了解自己的学习情况和进步空间</li>
              <li>遇到系统问题或有建议，可通过反馈模块及时提交反馈</li>
            </ul>
          </Card>
        </div>
      )}

      {userType === 'teacher' && (
        <div className={styles.tipsSection}>
          <Card
            className={styles.tipsCard}
            title={
              <div>
                <BulbOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                教学小贴士
              </div>
            }
          >
            <ul className={styles.tipsList}>
              <li>使用学生管理功能添加学生并了解具体情况</li>
              <li>创建不同难度的练习，并设置合理的截止时间</li>
              <li>利用智能问答系统辅助备课，选择相应的学科领域</li>
              <li>查看分析报告，了解学生整体学习情况和完成情况</li>
              <li>通过笔记功能记录教学要点和学生反馈情况</li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
