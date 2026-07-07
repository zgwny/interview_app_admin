import React from 'react';
import { Form, Input, Select, Button, Space, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { CATEGORIES, DIFFICULTIES, type Question } from '../../api/questions';
import { createQuestion, updateQuestion } from '../../api/questions';

interface Props {
  initial?: Question;
  onSuccess: () => void;
  onCancel: () => void;
}

const catOptions = CATEGORIES.map((c) => ({ label: c, value: c }));
const diffOptions = DIFFICULTIES.map((d) => ({ label: d, value: d }));

export default function QuestionForm({ initial, onSuccess, onCancel }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const isEdit = !!initial;

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

      <Form.Item name="content" label="题目内容" rules={[{ required: true }]}>
        <Input.TextArea rows={4} placeholder="题目描述（支持 Markdown）" />
      </Form.Item>

      <Form.Item name="answer" label="参考答案" rules={[{ required: true }]}>
        <Input.TextArea rows={6} placeholder="参考答案（支持 Markdown）" />
      </Form.Item>

      <Space style={{ width: '100%' }} size={16}>
        <Form.Item name="category" label="分类" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 0 }}>
          <Select options={catOptions} placeholder="选择分类" />
        </Form.Item>
        <Form.Item name="difficulty" label="难度" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 0 }}>
          <Select options={diffOptions} placeholder="选择难度" />
        </Form.Item>
      </Space>

      <Form.Item label="标签" style={{ marginTop: 16 }}>
        <Form.List name="tags">
          {(fields, { add, remove }) => (
            <>
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
            </>
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
