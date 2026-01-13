export interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at?: string;
}

export interface ExchangeRate {
  id: number;
  base_currency: string;
  target_currency: string;
  rate: number;
  date: string;
}

