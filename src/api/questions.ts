import client from './client';

export const CATEGORIES = ['javascript','typescript','css','html','react','vue','node','network','algorithm','other'] as const;
export const DIFFICULTIES = ['easy','medium','hard'] as const;
export type Category = typeof CATEGORIES[number];
export type Difficulty = typeof DIFFICULTIES[number];

export interface Question {
  _id: string;
  title: string;
  content: string;
  answer: string;
  category: Category;
  difficulty: Difficulty;
  tags: string[];
  viewCount: number;
  favoriteCount: number;
  createdBy: { _id: string; username: string };
  createdAt: string;
  updatedAt: string;
}

export type CreateQuestionDto = Omit<Question, '_id' | 'viewCount' | 'favoriteCount' | 'createdBy' | 'createdAt' | 'updatedAt'>;

export interface QuestionListParams {
  page?: number;
  limit?: number;
  category?: Category;
  difficulty?: Difficulty;
  keyword?: string;
  sort?: 'createdAt' | 'viewCount' | 'favoriteCount';
}

export interface Pagination { page: number; limit: number; total: number; pages: number; }

export const listQuestions = (params?: QuestionListParams) =>
  client.get<{ result: { items: Question[]; pagination: Pagination } }>('/api/questions', { params });

export const getQuestion = (id: string) =>
  client.get<{ data: Question }>(`/api/questions/${id}`);

export const createQuestion = (data: CreateQuestionDto) =>
  client.post<{ question: Question }>('/api/questions', data);

export const updateQuestion = (id: string, data: Partial<CreateQuestionDto>) =>
  client.put<{ question: Question }>(`/api/questions/${id}`, data);

export const deleteQuestion = (id: string) =>
  client.delete(`/api/questions/${id}`);
