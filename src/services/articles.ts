import api from './api'
import type { Article, ArticleResponse } from '../types'

export const articleService = {
  async getAll(): Promise<Article[]> {
    const response = await api.get<ArticleResponse>('/api/articles')
    if (Array.isArray(response.data.data)) {
      return response.data.data
    }
    return []
  },

  async getById(id: string): Promise<Article> {
    const response = await api.get<ArticleResponse>(`/api/articles/${id}`)
    return response.data.data as Article
  },

  async create(title: string, content: string): Promise<Article> {
    const response = await api.post<ArticleResponse>('/api/articles', { title, content })
    return response.data.data as Article
  },
}
