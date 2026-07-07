import client from './client';
import type { UserInfo } from './auth';

export interface UsersResult { items: UserInfo[]; pagination: { page: number; limit: number; total: number; pages: number } }

// 注意：后端目前无 /api/users 列表接口，通过 MongoDB 直连或扩展后端实现。
// 此处预留，并用 getMe 作演示。
export const getMe = () =>
  client.get<{ data: UserInfo }>('/api/auth/me');
