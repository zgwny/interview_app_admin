import { Button, Descriptions, Space, Tag, Tabs, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Question } from '../../api/questions';
import MarkdownView from '../../components/MarkdownView';

const diffColor: Record<string, string> = { easy: 'green', medium: 'orange', hard: 'red' };

interface Props { question: Question; onEdit: () => void; }

export default function QuestionDetail({ question, onEdit }: Props) {
  return (
    <div>
      {/* 标题 + 编辑按钮 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <Typography.Title level={5} style={{ margin: 0, flex: 1 }}>{question.title}</Typography.Title>
        <Button icon={<EditOutlined />} onClick={onEdit}>编辑</Button>
      </div>

      {/* 元数据 */}
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

      {/* 内容 + 答案用 Tabs 切换，Markdown 渲染 */}
      <Tabs
        items={[
          {
            key: 'content',
            label: '题目内容',
            children: (
              <div style={{ background: '#fafafa', borderRadius: 6, padding: '12px 16px', minHeight: 80 }}>
                <MarkdownView>{question.content}</MarkdownView>
              </div>
            ),
          },
          {
            key: 'answer',
            label: '参考答案',
            children: (
              <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, padding: '12px 16px', minHeight: 80 }}>
                <MarkdownView>{question.answer}</MarkdownView>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
