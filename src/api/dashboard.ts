import client from './client';
import type { UserListResult } from './users';

export interface DashboardStats {
  totalQuestions: number;
  totalUsers:     number;
  adminCount:     number;
  categoryDist:   { category: string; count: number }[];
  difficultyDist: { difficulty: string; count: number }[];
  recentQuestions: { _id: string; title: string; category: string; createdAt: string }[];
  recentUsers:     { id: string; username: string; email: string; role: string; createdAt: string }[];
}

/**
 * 并行拉取题目列表 + 用户列表，在前端汇总为 Dashboard 所需数据。
 * 后端暂无专用 /api/admin/stats 接口，复用现有接口聚合。
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [questionsRes, usersRes] = await Promise.all([
    client.get<{ result: { items: any[]; pagination: { total: number } } }>(
      '/api/questions',
      { params: { limit: 100, sort: 'createdAt' } }
    ),
    client.get<{ data: UserListResult }>(
      '/api/admin/users',
      { params: { limit: 100 } }
    ),
  ]);

  const questions = questionsRes.data.result.items;
  const users     = usersRes.data.data.items;
  const totalQuestions = questionsRes.data.result.pagination.total;
  const totalUsers     = usersRes.data.data.total;

  // 按分类统计
  const catMap = new Map<string, number>();
  const diffMap = new Map<string, number>();
  for (const q of questions) {
    catMap.set(q.category,   (catMap.get(q.category)   ?? 0) + 1);
    diffMap.set(q.difficulty, (diffMap.get(q.difficulty) ?? 0) + 1);
  }

  return {
    totalQuestions,
    totalUsers,
    adminCount:     users.filter((u) => u.role === 'admin').length,
    categoryDist:   [...catMap.entries()].map(([category, count]) => ({ category, count })),
    difficultyDist: [...diffMap.entries()].map(([difficulty, count]) => ({ difficulty, count })),
    recentQuestions: questions.slice(0, 5),
    recentUsers:     users.slice(0, 5),
  };
}
