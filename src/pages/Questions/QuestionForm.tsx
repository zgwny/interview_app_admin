import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Space, Tabs, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { DIFFICULTIES, type Question } from '../../api/questions';
import { createQuestion, updateQuestion } from '../../api/questions';
import { listCategories, type Category } from '../../api/categories';
import MarkdownView from '../../components/MarkdownView';

interface Props {
  initial?: Question;
  onSuccess: () => void;
  onCancel: () => void;
}

const diffOptions = DIFFICULTIES.map((d) => ({ label: d, value: d }));

/** 带编辑 / 预览 tab 的 Markdown 输入框 */
function MarkdownEditor({
  value, onChange, rows = 6, placeholder,
}: {
  value?: string;
  onChange?: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <Tabs
      size="small"
      style={{ marginBottom: 0 }}
      items={[
        {
          key: 'edit',
          label: '编辑',
          children: (
            <Input.TextArea
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              rows={rows}
              placeholder={placeholder}
              style={{ fontFamily: 'monospace', fontSize: 13 }}
            />
          ),
        },
        {
          key: 'preview',
          label: '预览',
          children: (
            <div style={{
              minHeight: rows * 22,
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              padding: '8px 12px',
              background: '#fafafa',
            }}>
              {value
                ? <MarkdownView>{value}</MarkdownView>
                : <span style={{ color: '#bbb' }}>（无内容）</span>}
            </div>
          ),
        },
      ]}
    />
  );
}

export default function QuestionForm({ initial, onSuccess, onCancel }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading]       = React.useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const isEdit = !!initial;

  useEffect(() => {
    listCategories().then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (initial) {
      form.setFieldsValue({ ...initial, tags: initial.tags ?? [] });
    } else {
      form.resetFields();
    }
  }, [initial, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (isEdit) {
        await updateQuestion(initial!._id, values);
        message.success('题目已更新');
      } else {
        await createQuestion(values);
        message.success('题目已创建');
      }
      onSuccess();
    } catch (err: any) {
      message.error(err.response?.data?.error || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ tags: [] }}>
      <Form.Item name="title" label="标题" rules={[{ required: true, min: 2, max: 200 }]}>
        <Input placeholder="请输入题目标题" />
      </Form.Item>

      <Form.Item name="content" label="题目内容（Markdown）" rules={[{ required: true }]}>
        <MarkdownEditor rows={4} placeholder="题目描述，支持 Markdown" />
      </Form.Item>

      <Form.Item name="answer" label="参考答案（Markdown）" rules={[{ required: true }]}>
        <MarkdownEditor rows={7} placeholder="参考答案，支持 Markdown 和代码块" />
      </Form.Item>

      <Space style={{ width: '100%' }} size={16}>
        <Form.Item name="category" label="分类" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 0 }}>
          <Select
            options={categories.map((c) => ({ label: c.label || c.name, value: c.name }))}
            placeholder="选择分类"
            showSearch
          />
        </Form.Item>
        <Form.Item name="difficulty" label="难度" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 0 }}>
          <Select options={diffOptions} placeholder="选择难度" />
        </Form.Item>
      </Space>

      <Form.Item label="标签" style={{ marginTop: 16 }}>
        <Form.List name="tags">
          {(fields, { add, remove }) => (
            <Space wrap>
              {fields.map((field) => (
                <Space key={field.key} size={4}>
                  <Form.Item {...field} noStyle rules={[{ required: true, message: '标签不能为空' }]}>
                    <Input placeholder="标签" style={{ width: 100 }} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(field.name)} style={{ color: '#ff4d4f' }} />
                </Space>
              ))}
              {fields.length < 10 && (
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small">
                  添加标签
                </Button>
              )}
            </Space>
          )}
        </Form.List>
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? '保存修改' : '创建题目'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
