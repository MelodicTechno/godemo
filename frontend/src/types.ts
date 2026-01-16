export interface Article {
  ID: number;
  Title: string;
  Content: string;
  Author?: string;
  CreatedAt?: string;
  Likes?: number;
}

export interface CreateArticlePayload {
  title: string;
  content: string;
  author: string;
}

export interface ExchangeRate {
  id: number;
  base_currency: string;
  target_currency: string;
  rate: number;
  date: string;
}

