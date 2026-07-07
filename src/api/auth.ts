import client from './client';

export interface LoginParams { email: string; password: string; }
export interface RegisterParams { username: string; email: string; password: string; }
export interface UserInfo { id: string; username: string; email: string; role: string; createdAt: string; }

export const login = (params: LoginParams) =>
  client.post<{ data: { token: string; user: UserInfo } }>('/api/auth/login', params);

export const register = (params: RegisterParams) =>
  client.post<{ data: UserInfo }>('/api/auth/register', params);

export const getMe = () =>
  client.get<{ data: UserInfo }>('/api/auth/me');
