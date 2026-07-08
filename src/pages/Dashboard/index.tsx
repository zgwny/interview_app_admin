import { useEffect, useState } from 'react';
import {
  Row, Col, Card, Statistic, Table, Tag, Typography,
  Spin, Progress, Space, Avatar,
} from 'antd';
import {
  QuestionCircleOutlined, UserOutlined,
  CrownOutlined, ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchDashboardStats, type DashboardStats } from '../../api/dashboard';

const catColor: Record<string, string> = {
  javascript: 'gold', typescript: 'blue', css: 'cyan', html: 'lime',
  react: 'geekblue', vue: 'green', node: 'purple', network: 'magenta',
  algorithm: 'volcano', other: 'default',
};
const diffColor: Record<string, string> = { easy: 'green', medium: 'orange', hard: 'red' };

export default function DashboardPage() {
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setStats(await fetchDashboardStats());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }
  if (!stats) return null;

  const maxCatCount = Math.max(...stats.categoryDist.map((c) => c.count), 1);
  const maxDiffCount = Math.max(...stats.difficultyDist.map((d) => d.count), 1);

  return (
    <>
      {/* 页头 */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>数据概览</Typography.Title>
        <Typography.Link onClick={load} style={{ fontSize: 13 }}>
          <ReloadOutlined style={{ marginRight: 4 }} />刷新
        </Typography.Link>
      </div>

      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="题目总数"
              value={stats.totalQuestions}
              prefix={<QuestionCircleOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="注册用户"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="管理员"
              value={stats.adminCount}
              prefix={<CrownOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="题目分类数"
              value={stats.categoryDist.length}
              prefix={<QuestionCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 分布图区 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 分类分布 */}
        <Col xs={24} lg={14}>
          <Card title="题目分类分布" size="small">
            <Space direction="vertical" style={{ width: '100%' }} size={10}>
              {stats.categoryDist
                .sort((a, b) => b.count - a.count)
                .map(({ category, count }) => (
                  <div key={category} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag color={catColor[category] ?? 'default'} style={{ width: 90, textAlign: 'center' }}>
                      {category}
                    </Tag>
                    <Progress
                      percent={Math.round((count / maxCatCount) * 100)}
                      format={() => `${count} 题`}
                      strokeColor={catColor[category] === 'default' ? '#d9d9d9' : undefined}
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                  </div>
                ))}
            </Space>
          </Card>
        </Col>

        {/* 难度分布 */}
        <Col xs={24} lg={10}>
          <Card title="难度分布" size="small">
            <Space direction="vertical" style={{ width: '100%' }} size={14}>
              {stats.difficultyDist
                .sort((a, b) => b.count - a.count)
                .map(({ difficulty, count }) => (
                  <div key={difficulty} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag color={diffColor[difficulty] ?? 'default'} style={{ width: 64, textAlign: 'center' }}>
                      {difficulty}
                    </Tag>
                    <Progress
                      percent={Math.round((count / maxDiffCount) * 100)}
                      format={() => `${count} 题`}
                      strokeColor={diffColor[difficulty]}
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                  </div>
                ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 最新数据 */}
      <Row gutter={[16, 16]}>
        {/* 最近题目 */}
        <Col xs={24} lg={14}>
          <Card title="最新题目" size="small">
            <Table
              rowKey="_id"
              size="small"
              pagination={false}
              dataSource={stats.recentQuestions}
              columns={[
                {
                  title: '标题', dataIndex: 'title', ellipsis: true,
                  render: (t) => <Typography.Text ellipsis style={{ maxWidth: 240 }}>{t}</Typography.Text>,
                },
                {
                  title: '分类', dataIndex: 'category', width: 100,
                  render: (v) => <Tag color={catColor[v] ?? 'default'}>{v}</Tag>,
                },
                {
                  title: '时间', dataIndex: 'createdAt', width: 90,
                  render: (v) => dayjs(v).format('MM-DD HH:mm'),
                },
              ]}
            />
          </Card>
        </Col>

        {/* 最新用户 */}
        <Col xs={24} lg={10}>
          <Card title="最新注册" size="small">
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {stats.recentUsers.map((u) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    style={{ background: u.role === 'admin' ? '#faad14' : '#1677ff', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.username}
                      {u.role === 'admin' && <Tag color="gold" style={{ marginLeft: 6, fontSize: 11 }}>管理员</Tag>}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: '#bbb', flexShrink: 0 }}>
                    {dayjs(u.createdAt).format('MM-DD')}
                  </span>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
}
