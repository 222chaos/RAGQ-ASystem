import { Button, Card, Typography } from 'antd';
import { useRouter } from 'next/router';
import styles from './index.module.css';

const { Title, Paragraph } = Typography;

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={1}>欢迎使用帮你读</Title>
        <Paragraph className={styles.description}>
          一个基于RAG技术的智能问答系统，帮助您更好地理解和学习知识
        </Paragraph>
      </div>
      <div className={styles.features}>
        <Card title="主要功能" className={styles.card}>
          <ul className={styles.featureList}>
            <li>多科目知识库支持：覆盖多个学科领域</li>
            <li>智能问答：基于RAG技术提供准确回答</li>
            <li>个性化分析：根据学习情况提供建议</li>
            <li>笔记管理：记录重要知识点</li>
            <li>反馈系统：持续优化用户体验</li>
          </ul>
        </Card>
        <Card title="使用指南" className={styles.card}>
          <ol className={styles.guideList}>
            <li>点击左侧菜单选择要查询的科目</li>
            <li>在问答界面输入您的问题</li>
            <li>系统会基于知识库提供专业回答</li>
            <li>可以保存重要内容到笔记</li>
            <li>随时可以查看学习分析报告</li>
          </ol>
        </Card>
      </div>
      <div className={styles.actions}>
        <Button type="primary" size="large" onClick={() => router.push('/qa')}>
          开始使用
        </Button>
      </div>
    </div>
  );
}
