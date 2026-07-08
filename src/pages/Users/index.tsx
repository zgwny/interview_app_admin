import { useCallback, useEffect, useState } from 'react';
import {
  Table, Button, Space, Tag, Input, Select, Popconfirm,
  Typography, message, Tooltip, Modal, Form, Radio, Avatar,
} from 'antd';
import {
  UserOutlined, CrownOutlined, SearchOutlined,
  DeleteOutlined, ReloadOutlined, EditOutlined, LockOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  listUsers, patchUser, deleteUser,
  type UserRow, type UserListParams,
} from '../../api/users';
import { useAuthStore } from '../../store/authStore';

export default function UsersPage() {
  const [data, setData]       = useState<UserRow[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams]   = useState<UserListParams>({ page: 1, limit: 10 });

  // 修改角色弹窗
  const [roleTarget, setRoleTarget]   = useState<UserRow | null>(null);
  const [roleForm]                    = Form.useForm();
  const [roleLoading, setRoleLoading] = useState(false);

  // 重置密码弹窗
  const [pwdTarget, setPwdTarget]   = useState<UserRow | null>(null);
  const [pwdForm]                   = Form.useForm();
  const [pwdLoading, setPwdLoading] = useState(false);

  const currentUser = useAuthStore((s) => s.user);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUsers(params);
      const { items, total } = res.data.data;
      setData(items);
      setTotal(total);
    } catch {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── 修改角色 ──────────────────────────────────────────────────────
  const openRoleModal = (user: UserRow) => {
    setRoleTarget(user);
    roleForm.setFieldValue('role', user.role);
  };

  const handleRoleOk = async () => {
    if (!roleTarget) return;
    const { role } = await roleForm.validateFields();
    setRoleLoading(true);
    try {
      await patchUser(roleTarget.id, { role });
      message.success('角色已更新');
      setRoleTarget(null);
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.error || '更新失败');
    } finally {
      setRoleLoading(false);
    }
  };

  // ── 重置密码 ──────────────────────────────────────────────────────
  const openPwdModal = (user: UserRow) => {
    setPwdTarget(user);
    pwdForm.resetFields();
  };

  const handlePwdOk = async () => {
    if (!pwdTarget) return;
    const { password } = await pwdForm.validateFields();
    setPwdLoading(true);
    try {
      await patchUser(pwdTarget.id, { password });
      message.success('密码已重置');
      setPwdTarget(null);
    } catch (err: any) {
      message.error(err.response?.data?.error || '重置失败');
    } finally {
      setPwdLoading(false);
    }
  };

  // ── 删除 ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      message.success('用户已删除');
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.error || '删除失败');
    }
  };

  // ── 列定义 ────────────────────────────────────────────────────────
  const columns: ColumnsType<UserRow> = [
    {
      title: '用户', dataIndex: 'username', width: '20%',
      render: (name, record) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{ background: record.role === 'admin' ? '#faad14' : '#1677ff' }}
          />
          <span>{name}</span>
          {record.id === currentUser?.id && (
            <Tag color="blue" style={{ fontSize: 11, lineHeight: '16px', padding: '0 4px' }}>我</Tag>
          )}
        </Space>
      ),
    },
    { title: '邮箱', dataIndex: 'email', width: '25%', ellipsis: true },
    {
      title: '角色', dataIndex: 'role', width: 100,
      render: (role) => role === 'admin'
        ? <Tag icon={<CrownOutlined />} color="gold">管理员</Tag>
        : <Tag color="default">普通用户</Tag>,
    },
    {
      title: '注册时间', dataIndex: 'createdAt', width: 130,
      render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作', key: 'action', width: 140, fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="修改角色">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openRoleModal(record)}
              disabled={record.id === currentUser?.id}
            />
          </Tooltip>
          <Tooltip title="重置密码">
            <Button
              size="small"
              icon={<LockOutlined />}
              onClick={() => openPwdModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除该用户？"
            description="此操作不可恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="删除" okType="danger" cancelText="取消"
            disabled={record.id === currentUser?.id}
          >
            <Tooltip title={record.id === currentUser?.id ? '不能删除自己' : '删除'}>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={record.id === currentUser?.id}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* 顶栏 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>用户管理</Typography.Title>
        <Space wrap>
          <Input
            placeholder="搜索用户名 / 邮箱"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            allowClear
            onChange={(e) => setParams((p) => ({ ...p, keyword: e.target.value || undefined, page: 1 }))}
          />
          <Select
            placeholder="角色筛选"
            allowClear
            style={{ width: 120 }}
            options={[
              { label: '管理员', value: 'admin' },
              { label: '普通用户', value: 'user' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, role: v, page: 1 }))}
          />
          <Select
            placeholder="排序"
            style={{ width: 120 }}
            defaultValue="createdAt"
            options={[
              { label: '注册时间', value: 'createdAt' },
              { label: '用户名', value: 'username' },
            ]}
            onChange={(v: UserListParams['sort']) => setParams((p) => ({ ...p, sort: v, page: 1 }))}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
        </Space>
      </div>

      {/* 用户表格 */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: 800 }}
        pagination={{
          current: params.page,
          pageSize: params.limit,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 位用户`,
          onChange: (page, limit) => setParams((p) => ({ ...p, page, limit })),
        }}
      />

      {/* 修改角色弹窗 */}
      <Modal
        title={`修改角色 — ${roleTarget?.username}`}
        open={!!roleTarget}
        onOk={handleRoleOk}
        onCancel={() => setRoleTarget(null)}
        confirmLoading={roleLoading}
        okText="确认" cancelText="取消"
        destroyOnClose
      >
        <Form form={roleForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio.Button value="user">普通用户</Radio.Button>
              <Radio.Button value="admin">管理员</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* 重置密码弹窗 */}
      <Modal
        title={`重置密码 — ${pwdTarget?.username}`}
        open={!!pwdTarget}
        onOk={handlePwdOk}
        onCancel={() => setPwdTarget(null)}
        confirmLoading={pwdLoading}
        okText="确认重置" cancelText="取消"
        destroyOnClose
      >
        <Form form={pwdForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码（至少 6 位）" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('两次密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
