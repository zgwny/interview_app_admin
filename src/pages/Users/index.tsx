import { useEffect, useState } from 'react';
import {
  Table, Tag, Typography, Card, Statistic, Row, Col,
  Avatar, Space, message, Button,
} from 'antd';
import { UserOutlined, CrownOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface UserRow {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  favorites?: string[];
}

export default function UsersPage() {
  const [users, setUsers]     = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const currentUser = useAuthStore((s) => s.user);

  // 直接调用后端 /api/auth/me 拿到当前用户
  // 由于 API 无用户列表接口，此页展示当前用户信息 + 说明
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/auth/me');
      const me = res.data.data;
      setUsers([{ _id: me.id, username: me.username, email: me.email, role: me.role, createdAt: me.createdAt }]);
    } catch {
      message.error('加载用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const columns: ColumnsType<UserRow> = [
    {
      title: '用户', dataIndex: 'username',
      render: (name) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} style={{ background: '#1677ff' }} />
          <span>{name}</span>
        </Space>
      ),
    },
    { title: '邮箱', dataIndex: 'email' },
    {
      title: '角色', dataIndex: 'role',
      render: (role) => role === 'admin'
        ? <Tag icon={<CrownOutlined />} color="gold">管理员</Tag>
        : <Tag color="default">普通用户</Tag>,
    },
    {
      title: '注册时间', dataIndex: 'createdAt',
      render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>用户管理</Typography.Title>
        <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
      </div>

      {/* 当前登录用户信息卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="当前用户" value={currentUser?.username ?? '-'} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="角色" value={currentUser?.role === 'admin' ? '管理员' : '普通用户'} prefix={<CrownOutlined />} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title="邮箱" value={currentUser?.email ?? '-'} />
          </Card>
        </Col>
      </Row>

      <Card title="账号信息" extra={<Typography.Text type="secondary" style={{ fontSize: 12 }}>如需查看所有用户，请扩展后端 /api/admin/users 接口</Typography.Text>}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={false}
        />
      </Card>
    </>
  );
}
