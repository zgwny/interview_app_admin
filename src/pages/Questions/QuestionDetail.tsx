import { Button, Descriptions, Space, Tag, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Question } from '../../api/questions';

const diffColor: Record<string, string> = { easy: 'green', medium: 'orange', hard: 'red' };

interface Props { question: Question; onEdit: () => void; }

export default function QuestionDetail({ question, onEdit }: Props) {
  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>{question.title}</Typography.Title>
        <Button icon={<EditOutlined />} onClick={onEdit}>编辑</Button>
      </div>

      <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
        <Descriptions.Item label="分类">
          <Tag>{question.category}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="难度">
          <Tag color={diffColor[question.difficulty]}>{question.difficulty}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="标签" span={2}>
          <Space wrap>
            {question.tags.length > 0
              ? question.tags.map((t) => <Tag key={t}>{t}</Tag>)
              : <Typography.Text type="secondary">无</Typography.Text>}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="浏览次数">{question.viewCount}</Descriptions.Item>
        <Descriptions.Item label="收藏次数">{question.favoriteCount}</Descriptions.Item>
        <Descriptions.Item label="创建者">{question.createdBy?.username ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{dayjs(question.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
      </Descriptions>

      <Typography.Title level={5}>题目内容</Typography.Title>
      <div style={{ background: '#fafafa', padding: 16, borderRadius: 6, marginBottom: 24, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
        {question.content}
      </div>

      <Typography.Title level={5}>参考答案</Typography.Title>
      <div style={{ background: '#f6ffed', padding: 16, borderRadius: 6, border: '1px solid #b7eb8f', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
        {question.answer}
      </div>
    </div>
  );
}
