import client from './client';

export interface UserRow {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail extends UserRow {
  stats: { totalSessions: number; finishedSessions: number };
}

export interface UserListParams {
  page?:    number;
  limit?:   number;
  keyword?: string;
  role?:    'user' | 'admin';
  sort?:    'createdAt' | 'username';
}

export interface UserListResult {
  items:      UserRow[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface PatchUserDto {
  role?:     'user' | 'admin';
  password?: string;
}

export const listUsers = (params?: UserListParams) =>
  client.get<{ data: UserListResult }>('/api/admin/users', { params });

export const getUser = (id: string) =>
  client.get<{ data: UserDetail }>(`/api/admin/users/${id}`);

export const patchUser = (id: string, dto: PatchUserDto) =>
  client.patch<{ user: UserRow }>(`/api/admin/users/${id}`, dto);

export const deleteUser = (id: string) =>
  client.delete(`/api/admin/users/${id}`);
