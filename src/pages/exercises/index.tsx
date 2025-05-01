import { Card, List, Modal, Tag, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styles from './index.module.css';

const { Title, Paragraph } = Typography;

interface Exercise {
  id: string;
  title: string;
  description: string;
  content: string;
  difficulty: string;
  status: string;
  created_at: string;
  deadline: string | null;
}

const ExercisesPage = () => {
  const { data: session } = useSession();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises/list');
        if (!response.ok) {
          throw new Error('获取练习列表失败');
        }
        const data = await response.json();
        setExercises(data.data);
      } catch (error) {
        console.error('获取练习列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchExercises();
    }
  }, [session]);

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

  const handleCardClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  return (
    <div className={styles.container}>
      <List<Exercise>
        loading={loading}
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={exercises}
        renderItem={(exercise) => (
          <List.Item>
            <Card
              title={exercise.title}
              extra={
                <Tag color={getDifficultyColor(exercise.difficulty)}>{exercise.difficulty}</Tag>
              }
              className={styles.exerciseCard}
              onClick={() => handleCardClick(exercise)}
              hoverable
            >
              <Paragraph ellipsis={{ rows: 3 }}>{exercise.description}</Paragraph>
              <div className={styles.cardFooter}>
                <span className={styles.createTime}>创建时间：{exercise.created_at}</span>
                {exercise.deadline && (
                  <span className={styles.deadline}>截止时间：{exercise.deadline}</span>
                )}
              </div>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={selectedExercise?.title}
        open={!!selectedExercise}
        onCancel={() => setSelectedExercise(null)}
        footer={null}
        width={800}
        className={styles.modal}
      >
        {selectedExercise && (
          <>
            <Paragraph>{selectedExercise.description}</Paragraph>
            <div className={styles.modalFooter}>
              <Tag color={getDifficultyColor(selectedExercise.difficulty)}>
                {selectedExercise.difficulty}
              </Tag>
              <Tag color={getStatusColor(selectedExercise.status)}>{selectedExercise.status}</Tag>
              <span className={styles.createTime}>创建时间：{selectedExercise.created_at}</span>
              {selectedExercise.deadline && (
                <span className={styles.deadline}>截止时间：{selectedExercise.deadline}</span>
              )}
            </div>
            <div className={styles.content}>
              <Title level={4}>练习内容</Title>
              <Paragraph>{selectedExercise.content}</Paragraph>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ExercisesPage;
