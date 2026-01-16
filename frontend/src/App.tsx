import { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import {
  createArticle,
  getArticles,
  getArticleLikes,
  getExchangeRates,
  likeArticle,
  login,
  register,
  ApiError,
} from "./api";
import type { Article, ExchangeRate } from "./types";

type AuthMode = "login" | "register";

function useAuthToken() {
  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem("token");
    return t === "null" || t === "undefined" ? null : t;
  });

  const updateToken = (value: string | null) => {
    setToken(value);
    if (value) {
      localStorage.setItem("token", value);
    } else {
      localStorage.removeItem("token");
    }
  };

  return { token, setToken: updateToken };
}

export default function App() {
  const { token, setToken } = useAuthToken();
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [articles, setArticles] = useState<Article[]>([]);
  const [likes, setLikes] = useState<Record<number, string>>({});
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [posting, setPosting] = useState(false);

  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      void loadFeed();
    }
    void loadRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadFeed() {
    if (!token) return;
    try {
      setFeedLoading(true);
      setFeedError(null);
      const data = await getArticles(token);
      setArticles(data);

      const likesMap: Record<number, string> = {};
      await Promise.all(
        data.map(async (article) => {
          try {
            const res = await getArticleLikes(token, article.ID);
            likesMap[article.ID] = res.likes;
          } catch {
            // ignore
          }
        })
      );
      setLikes(likesMap);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setToken(null);
        return;
      }
      setFeedError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setFeedLoading(false);
    }
  }

  async function loadRates() {
    try {
      setRatesLoading(true);
      setRatesError(null);
      const data = await getExchangeRates();
      setRates(data);
    } catch (err) {
      setRatesError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setRatesLoading(false);
    }
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const fn = authMode === "login" ? login : register;
      const res = await fn(username, password);
      setToken(res.token);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handlePostArticle(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!newTitle.trim() || !newContent.trim() || !newAuthor.trim()) return;
    try {
      setPosting(true);
      const article = await createArticle(token, {
        title: newTitle.trim(),
        content: newContent.trim(),
        author: newAuthor.trim(),
      });
      setArticles((prev) => [article, ...prev]);
      setNewTitle("");
      setNewContent("");
      setNewAuthor("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "发布失败");
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(id: number) {
    if (!token) return;
    try {
      await likeArticle(token, id);
      const res = await getArticleLikes(token, id);
      setLikes((prev) => ({ ...prev, [id]: res.likes }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "点赞失败");
    }
  }

  const AuthView = (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="max-w-md w-full px-8 py-10 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-full bg-sky-500 flex items-center justify-center text-xl">
            x
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Exchange Timeline
          </span>
        </div>
        <div className="flex mb-6 border-b border-slate-800">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium ${
              authMode === "login"
                ? "text-sky-400 border-b-2 border-sky-500"
                : "text-slate-400"
            }`}
            onClick={() => setAuthMode("login")}
          >
            登录
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium ${
              authMode === "register"
                ? "text-sky-400 border-b-2 border-sky-500"
                : "text-slate-400"
            }`}
            onClick={() => setAuthMode("register")}
          >
            注册
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleAuthSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300">用户名</label>
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入用户名"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300">密码</label>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
            />
          </div>
          {authError && (
            <div className="text-xs text-red-400 whitespace-pre-line">
              {authError}
            </div>
          )}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full mt-2 rounded-full bg-sky-500 hover:bg-sky-600 transition-colors py-2 text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {authMode === "login" ? "登录" : "注册"}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {token ? (
        <div className="max-w-6xl mx-auto flex">
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 px-4 py-4 gap-4 sticky top-0 h-screen">
          <div className="flex items-center gap-2 px-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-sky-500 flex items-center justify-center text-xl">
              x
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Exchange
            </span>
          </div>
          <nav className="space-y-1 text-sm">
            <Link to="/feed" className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-slate-900">
              <span>首页</span>
            </Link>
            <Link to="/rates" className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-slate-900">
              <span>汇率</span>
            </Link>
          </nav>
          <button
            type="button"
            onClick={() => setToken(null)}
            className="mt-auto mb-4 rounded-full bg-slate-800 hover:bg-slate-700 text-sm font-semibold py-2 px-4"
          >
            退出登录
          </button>
        </aside>

        <main className="flex-1 border-r border-slate-800 min-h-screen">
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/feed" element={
              <>
              <div className="border-b border-slate-800 px-4 py-3 font-semibold text-lg">
                首页
              </div>

              <form
                className="border-b border-slate-800 px-4 py-3 space-y-3"
                onSubmit={handlePostArticle}
              >
                <input
                  className="w-full bg-transparent text-lg placeholder:text-slate-500 outline-none"
                  placeholder="发生了什么？"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <textarea
                  className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-slate-500"
                  rows={3}
                  placeholder="详细说说..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
                <input
                  className="w-full bg-transparent text-sm placeholder:text-slate-500 outline-none border-b border-slate-800 pb-2"
                  placeholder="署名（作者）"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={posting}
                    className="rounded-full bg-sky-500 hover:bg-sky-600 px-4 py-1.5 text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    发布
                  </button>
                </div>
              </form>

              {feedLoading && (
                <div className="px-4 py-4 text-sm text-slate-400">
                  正在加载时间线...
                </div>
              )}
              {feedError && (
                <div className="px-4 py-4 text-sm text-red-400">
                  {feedError}
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                {articles.map((article) => (
                  <article
                    key={article.ID}
                    className="border-b border-slate-800 p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-medium">
                          {(article.Author?.[0] || "U").toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-slate-200 truncate">
                            {article.Author || "Unknown"}
                          </span>
                          <span className="text-slate-500 text-sm">
                            · {new Date(article.CreatedAt || "").toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-slate-200 mb-1 leading-snug">
                          {article.Title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {article.Content}
                        </p>

                        <div className="flex items-center gap-6 mt-3 text-slate-500 text-sm">
                          <button
                            onClick={() => handleLike(article.ID)}
                            className="flex items-center gap-1.5 hover:text-pink-500 transition-colors group"
                          >
                            <div className="p-1.5 -ml-1.5 rounded-full group-hover:bg-pink-500/10 transition-colors">
                              ♥
                            </div>
                            <span>{likes[article.ID] || article.Likes || 0}</span>
                          </button>
                          <button className="flex items-center gap-1.5 hover:text-sky-500 transition-colors group">
                            <div className="p-1.5 -ml-1.5 rounded-full group-hover:bg-sky-500/10 transition-colors">
                              💬
                            </div>
                            <span>0</span>
                          </button>
                          <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors group">
                            <div className="p-1.5 -ml-1.5 rounded-full group-hover:bg-emerald-500/10 transition-colors">
                              ⚡
                            </div>
                            <span>0</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
                {articles.length === 0 && !feedLoading && (
                  <div className="py-20 text-center text-slate-500">
                    暂无内容，快来发布第一条吧
                  </div>
                )}
              </div>
              </>
            } />
            <Route path="/rates" element={
              <>
              <div className="border-b border-slate-800 px-4 py-3 font-semibold text-lg">
                汇率
              </div>
              <div className="px-4 py-4 space-y-3">
                {ratesLoading && (
                  <div className="text-sm text-slate-400">正在加载...</div>
                )}
                {ratesError && (
                  <div className="text-sm text-red-400">{ratesError}</div>
                )}
                <div className="space-y-2">
                  {rates.map((rate) => (
                    <div
                      key={rate.id}
                      className="flex items-center justify-between rounded-xl bg-slate-900/80 border border-slate-800 px-3 py-2 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {rate.base_currency} → {rate.target_currency}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(rate.date).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sky-400 font-semibold">
                        {rate.rate}
                      </div>
                    </div>
                  ))}
                  {!ratesLoading && rates.length === 0 && (
                    <div className="text-sm text-slate-500">
                      暂无汇率数据。
                    </div>
                  )}
                </div>
              </div>
              </>
            } />
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
        </main>

        <aside className="hidden lg:block w-80 px-4 py-4 space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-3">
            <h2 className="text-sm font-semibold mb-2">汇率一览</h2>
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              {rates.map((rate) => (
                <div
                  key={rate.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-slate-300">
                    {rate.base_currency}/{rate.target_currency}
                  </span>
                  <span className="text-sky-400 font-semibold">
                    {rate.rate}
                  </span>
                </div>
              ))}
              {!ratesLoading && rates.length === 0 && (
                <div className="text-xs text-slate-500">暂无数据</div>
              )}
            </div>
          </div>
        </aside>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={AuthView} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  );
}

