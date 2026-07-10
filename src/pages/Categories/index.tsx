import { useCallback, useEffect, useState } from 'react';
import {
  Table, Button, Space, Typography, message, Popconfirm,
  Modal, Form, Input, InputNumber, ColorPicker, Tag, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ReloadOutlined, HolderOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  listAdminCategories, createCategory, updateCategory, deleteCategory, updateCategorySort,
  type Category,
} from '../../api/categories';

export default function CategoriesPage() {
  const [data, setData]         = useState<Category[]>([]);
  const [loading, setLoading]   = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [saving, setSaving]     = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminCategories();
      setData(res.data.items);
    } catch {
      message.error('加载分类失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── 打开弹窗 ──────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    form.resetFields();
    form.setFieldsValue({ color: '#1677ff', sort: 99 });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    form.setFieldsValue({ label: cat.label, color: cat.color, sort: cat.sort });
    setModalOpen(true);
  };

  // ── 保存 ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    const values = await form.validateFields();
    // ColorPicker 返回的是对象，需要转成 hex 字符串
    const color = typeof values.color === 'string'
      ? values.color
      : values.color?.toHexString?.() ?? values.color;
    setSaving(true);
    try {
      if (editTarget) {
        await updateCategory(editTarget._id, { ...values, color });
        message.success('分类已更新');
      } else {
        await createCategory({ ...values, color });
        message.success('分类已创建');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.error || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  // ── 删除 ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      message.success('分类已删除');
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.error || '删除失败');
    }
  };

  // ── 上移/下移排序 ─────────────────────────────────────────────────
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newData = [...data];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newData.length) return;
    [newData[index], newData[targetIndex]] = [newData[targetIndex], newData[index]];
    // 重新赋予 sort 值
    const items = newData.map((c, i) => ({ id: c._id, sort: i + 1 }));
    try {
      await updateCategorySort(items);
      fetchData();
    } catch {
      message.error('排序更新失败');
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: '排序', key: 'sort', width: 80, align: 'center',
      render: (_, __, index) => (
        <Space direction="vertical" size={0}>
          <Button size="small" type="text" icon={<HolderOutlined />}
            disabled={index === 0}
            onClick={() => handleMove(index, 'up')}
            style={{ padding: 0, height: 16, color: index === 0 ? '#d9d9d9' : '#666' }}
          />
          <Button size="small" type="text" icon={<HolderOutlined rotate={180} />}
            disabled={index === data.length - 1}
            onClick={() => handleMove(index, 'down')}
            style={{ padding: 0, height: 16, color: index === data.length - 1 ? '#d9d9d9' : '#666' }}
          />
        </Space>
      ),
    },
    {
      title: '标识（name）', dataIndex: 'name', width: 140,
      render: (name) => <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{name}</code>,
    },
    {
      title: '显示名称', dataIndex: 'label', width: 120,
    },
    {
      title: '颜色', dataIndex: 'color', width: 100,
      render: (color) => (
        <Space>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: color, border: '1px solid #d9d9d9' }} />
          <Tag color={color} style={{ margin: 0 }}>{color}</Tag>
        </Space>
      ),
    },
    {
      title: '预览', key: 'preview', width: 100,
      render: (_, cat) => <Tag color={cat.color}>{cat.label || cat.name}</Tag>,
    },
    {
      title: '题目数', dataIndex: 'questionCount', width: 80, align: 'center',
      render: (v) => <span style={{ color: v > 0 ? '#1677ff' : '#bbb' }}>{v ?? 0}</span>,
    },
    {
      title: '操作', key: 'action', width: 120, fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="编辑">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="确认删除该分类？"
            description={
              (record.questionCount ?? 0) > 0
                ? `该分类下有 ${record.questionCount} 道题目，无法删除`
                : '删除后不可恢复'
            }
            onConfirm={() => handleDelete(record._id)}
            okText="删除" okType="danger" cancelText="取消"
            disabled={(record.questionCount ?? 0) > 0}
          >
            <Tooltip title={(record.questionCount ?? 0) > 0 ? `有 ${record.questionCount} 道题目，不能删除` : '删除'}>
              <Button
                size="small" danger icon={<DeleteOutlined />}
                disabled={(record.questionCount ?? 0) > 0}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>分类管理</Typography.Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增分类</Button>
        </Space>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        scroll={{ x: 700 }}
        size="small"
      />

      {/* 新建 / 编辑弹窗 */}
      <Modal
        title={editTarget ? `编辑分类 — ${editTarget.name}` : '新增分类'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText="保存" cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {!editTarget && (
            <Form.Item
              name="name"
              label="标识（英文，创建后不可修改）"
              rules={[
                { required: true, message: '请输入标识' },
                { pattern: /^[a-z0-9-]+$/, message: '只能使用小写字母、数字和连字符' },
              ]}
            >
              <Input placeholder="如：python、go、system-design" />
            </Form.Item>
          )}
          <Form.Item name="label" label="显示名称" rules={[{ required: true, message: '请输入显示名称' }]}>
            <Input placeholder="如：Python、Go、系统设计" />
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <ColorPicker format="hex" showText />
          </Form.Item>
          <Form.Item name="sort" label="排序权重（越小越靠前）">
            <InputNumber min={0} max={999} style={{ width: 160 }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
