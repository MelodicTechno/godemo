import type { Article, ExchangeRate } from "./types";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return (await res.json()) as T;
}

export async function login(username: string, password: string) {
  return request<{ token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function register(username: string, password: string) {
  return request<{ token: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function getArticles(token: string) {
  return request<Article[]>("/api/articles", {
    headers: {
      Authorization: token,
    },
  });
}

export async function createArticle(
  token: string,
  data: Pick<Article, "title" | "content" | "author">
) {
  return request<Article>("/api/articles", {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify(data),
  });
}

export async function likeArticle(token: string, id: number) {
  return request<{ message: string }>(`/api/articles/${id}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  });
}

export async function getArticleLikes(token: string, id: number) {
  return request<{ likes: string }>(`/api/articles/${id}/likes`, {
    headers: {
      Authorization: token,
    },
  });
}

export async function getExchangeRates() {
  return request<ExchangeRate[]>("/api/exchangeRates");
}

