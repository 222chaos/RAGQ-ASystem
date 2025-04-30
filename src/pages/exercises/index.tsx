import { Card, List, Tag, Typography } from 'antd';
import { useState } from 'react';
import styles from './index.module.css';

const { Title, Paragraph } = Typography;

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  createTime: string;
  status: '未完成' | '已完成';
}

const ExercisesPage = () => {
  const [exercises] = useState<Exercise[]>([
    {
      id: '1',
      title: '基础语法练习',
      description: '包含基础语法知识的练习题，包括时态、语态、从句等基础语法点的练习。',
      difficulty: '简单',
      createTime: '2024-04-30',
      status: '未完成',
    },
    {
      id: '2',
      title: '阅读理解练习',
      description: '提高阅读理解能力的练习题，包含多篇不同主题的文章和相应的问题。',
      difficulty: '中等',
      createTime: '2024-04-29',
      status: '已完成',
    },
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '简单':
        return 'green';
      case '中等':
        return 'orange';
      case '困难':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getStatusColor = (status: string) => {
    return status === '已完成' ? 'green' : 'blue';
  };

  return (
    <div className={styles.container}>
      <Title level={2}>练习列表</Title>
      <List<Exercise>
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={exercises}
        renderItem={(exercise) => (
          <List.Item>
            <Card
              title={exercise.title}
              extra={<Tag color={getStatusColor(exercise.status)}>{exercise.status}</Tag>}
              className={styles.exerciseCard}
            >
              <Paragraph ellipsis={{ rows: 3 }}>{exercise.description}</Paragraph>
              <div className={styles.cardFooter}>
                <Tag color={getDifficultyColor(exercise.difficulty)}>{exercise.difficulty}</Tag>
                <span className={styles.createTime}>创建时间：{exercise.createTime}</span>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ExercisesPage;
