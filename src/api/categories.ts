import client from './client';

export interface Category {
  _id:           string;
  name:          string;
  label:         string;
  color:         string;
  sort:          number;
  questionCount?: number;
  createdAt:     string;
}

export interface CreateCategoryDto {
  name:   string;
  label?: string;
  color?: string;
  sort?:  number;
}

export interface UpdateCategoryDto {
  label?: string;
  color?: string;
  sort?:  number;
}

export const listCategories = () =>
  client.get<{ categories: Category[] }>('/api/categories');

export const listAdminCategories = () =>
  client.get<{ items: Category[] }>('/api/admin/categories');

export const createCategory = (dto: CreateCategoryDto) =>
  client.post<{ cat: Category }>('/api/admin/categories', dto);

export const updateCategory = (id: string, dto: UpdateCategoryDto) =>
  client.put<{ cat: Category }>(`/api/admin/categories/${id}`, dto);

export const deleteCategory = (id: string) =>
  client.delete(`/api/admin/categories/${id}`);

export const updateCategorySort = (items: { id: string; sort: number }[]) =>
  client.patch<{ categories: Category[] }>('/api/admin/categories/sort', { items });
