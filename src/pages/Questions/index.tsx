import { useCallback, useEffect, useState } from 'react';
import {
  Table, Button, Space, Tag, Input, Select, Popconfirm,
  Drawer, Typography, message, Tooltip, Badge,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined,
  DeleteOutlined, EyeOutlined, ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  listQuestions, deleteQuestion,
  CATEGORIES, DIFFICULTIES,
  type Question, type QuestionListParams,
} from '../../api/questions';
import QuestionForm from './QuestionForm';
import QuestionDetail from './QuestionDetail';

const difficultyColor: Record<string, string> = { easy: 'green', medium: 'orange', hard: 'red' };
const catColor: Record<string, string> = {
  javascript: 'gold', typescript: 'blue', css: 'cyan', html: 'lime',
  react: 'geekblue', vue: 'green', node: 'purple', network: 'magenta',
  algorithm: 'volcano', other: 'default',
};

export default function QuestionsPage() {
  const [data, setData]       = useState<Question[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams]   = useState<QuestionListParams>({ page: 1, limit: 10 });

  // 表单抽屉
  const [formOpen, setFormOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState<Question | undefined>();
  // 详情抽屉
  const [detailOpen, setDetailOpen]   = useState(false);
  const [detailTarget, setDetailTarget] = useState<Question | undefined>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listQuestions(params);
      const { items, pagination } = res.data.result;
      setData(items);
      setTotal(pagination.total);
    } catch {
      message.error('加载题目失败');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion(id);
      message.success('题目已删除');
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.error || '删除失败');
    }
  };

  const openCreate = () => { setEditTarget(undefined); setFormOpen(true); };
  const openEdit   = (q: Question) => { setEditTarget(q); setFormOpen(true); };
  const openDetail = (q: Question) => { setDetailTarget(q); setDetailOpen(true); };

  const columns: ColumnsType<Question> = [
    {
      title: '标题', dataIndex: 'title', ellipsis: true, width: '28%',
      render: (text, record) => (
        <Button type="link" style={{ padding: 0, textAlign: 'left', height: 'auto', whiteSpace: 'normal' }}
          onClick={() => openDetail(record)}>{text}</Button>
      ),
    },
    {
      title: '分类', dataIndex: 'category', width: 110,
      render: (v) => <Tag color={catColor[v] ?? 'default'}>{v}</Tag>,
    },
    {
      title: '难度', dataIndex: 'difficulty', width: 80,
      render: (v) => <Badge color={difficultyColor[v]} text={v} />,
    },
    {
      title: '标签', dataIndex: 'tags', width: 180,
      render: (tags: string[]) => (
        <Space size={4} wrap>
          {tags.slice(0, 3).map((t) => <Tag key={t}>{t}</Tag>)}
          {tags.length > 3 && <Tag>+{tags.length - 3}</Tag>}
        </Space>
      ),
    },
    {
      title: '浏览 / 收藏', width: 100, align: 'center',
      render: (_, r) => <span style={{ color: '#888', fontSize: 12 }}>{r.viewCount} / {r.favoriteCount}</span>,
    },
    {
      title: '创建者', dataIndex: 'createdBy', width: 90,
      render: (v) => v?.username ?? '-',
    },
    {
      title: '创建时间', dataIndex: 'createdAt', width: 120,
      render: (v) => dayjs(v).format('MM-DD HH:mm'),
    },
    {
      title: '操作', key: 'action', width: 120, fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="查看"><Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(record)} /></Tooltip>
          <Tooltip title="编辑"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} /></Tooltip>
          <Popconfirm title="确认删除该题目？" onConfirm={() => handleDelete(record._id)} okText="删除" okType="danger" cancelText="取消">
            <Tooltip title="删除"><Button size="small" danger icon={<DeleteOutlined />} /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>题目管理</Typography.Title>
        <Space wrap>
          <Input
            placeholder="关键词搜索"
            prefix={<SearchOutlined />}
            style={{ width: 180 }}
            allowClear
            onChange={(e) => setParams((p) => ({ ...p, keyword: e.target.value || undefined, page: 1 }))}
          />
          <Select
            placeholder="分类"
            allowClear style={{ width: 130 }}
            options={CATEGORIES.map((c) => ({ label: c, value: c }))}
            onChange={(v) => setParams((p) => ({ ...p, category: v, page: 1 }))}
          />
          <Select
            placeholder="难度"
            allowClear style={{ width: 100 }}
            options={DIFFICULTIES.map((d) => ({ label: d, value: d }))}
            onChange={(v) => setParams((p) => ({ ...p, difficulty: v, page: 1 }))}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建题目</Button>
        </Space>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: 900 }}
        pagination={{
          current: params.page,
          pageSize: params.limit,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 道题`,
          onChange: (page, limit) => setParams((p) => ({ ...p, page, limit })),
        }}
      />

      {/* 新建 / 编辑抽屉 */}
      <Drawer
        title={editTarget ? '编辑题目' : '新建题目'}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        width={640}
        destroyOnClose
      >
        <QuestionForm
          initial={editTarget}
          onSuccess={() => { setFormOpen(false); fetchData(); }}
          onCancel={() => setFormOpen(false)}
        />
      </Drawer>

      {/* 详情抽屉 */}
      <Drawer
        title="题目详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={680}
        destroyOnClose
      >
        {detailTarget && <QuestionDetail question={detailTarget} onEdit={() => { setDetailOpen(false); openEdit(detailTarget); }} />}
      </Drawer>
    </>
  );
}
