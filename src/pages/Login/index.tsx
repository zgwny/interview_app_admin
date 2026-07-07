import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await login(values);
      const { token, user } = res.data.data;
      setAuth(token, user);
      message.success('登录成功');
      navigate('/');
    } catch (err: any) {
      message.error(err.response?.data?.error || '登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Typography.Title level={2} style={{ color: '#1677ff', margin: 0 }}>面试题管理后台</Typography.Title>
          <Typography.Text type="secondary">Interview App Admin</Typography.Text>
        </div>
        <Form form={form} onFinish={onFinish} size="large" layout="vertical">
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入正确的邮箱' }]}>
            <Input prefix={<UserOutlined />} placeholder="admin@interview.app" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>登录</Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            默认管理员：admin@interview.app / Admin@123
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}
