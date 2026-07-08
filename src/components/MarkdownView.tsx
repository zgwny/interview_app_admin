import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import 'highlight.js/styles/github.css';

interface Props {
  children: string;
  /** 背景色，默认透明 */
  background?: string;
}

/**
 * 统一 Markdown 渲染组件，支持 GFM 表格/删除线/任务列表，代码块语法高亮。
 */
export default function MarkdownView({ children, background }: Props) {
  return (
    <div
      className="md-body"
      style={{
        background: background ?? 'transparent',
        padding: background ? '16px' : 0,
        borderRadius: 6,
        lineHeight: 1.8,
        fontSize: 14,
        overflowX: 'auto',
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
          // 代码块样式
          pre: ({ children, ...props }) => (
            <pre {...props} style={{ borderRadius: 6, padding: '12px 16px', overflowX: 'auto', margin: '12px 0' }}>
              {children}
            </pre>
          ),
          // 行内代码
          code: ({ children, className, ...props }) => {
            const isBlock = !!className;
            return isBlock
              ? <code className={className} {...props}>{children}</code>
              : <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 3, fontSize: '0.9em' }} {...props}>{children}</code>;
          },
          // 表格
          table: ({ children, ...props }) => (
            <div style={{ overflowX: 'auto', margin: '12px 0' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }} {...props}>{children}</table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th style={{ border: '1px solid #d9d9d9', padding: '6px 12px', background: '#fafafa', textAlign: 'left' }} {...props}>{children}</th>
          ),
          td: ({ children, ...props }) => (
            <td style={{ border: '1px solid #d9d9d9', padding: '6px 12px' }} {...props}>{children}</td>
          ),
          // 块引用
          blockquote: ({ children, ...props }) => (
            <blockquote style={{ borderLeft: '4px solid #1677ff', margin: '12px 0', paddingLeft: 16, color: '#666' }} {...props}>{children}</blockquote>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
