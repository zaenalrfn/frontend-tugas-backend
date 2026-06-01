export interface User {
  id: string
  name?: string
  email: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: User
}

export interface Article {
  id: string
  title: string
  content: string
  author_id: string
  created_at?: string
  updated_at?: string
}

export interface ArticleResponse {
  success: boolean
  message: string
  data: Article | Article[]
}
