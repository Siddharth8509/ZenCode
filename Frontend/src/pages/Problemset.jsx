import { useSelector } from "react-redux";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import Navbar from "../components/Navbar";

export default function Problemset() {
  const navigate = useNavigate();

  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  const handleAdmin = () => {
    navigate("/admin");
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  const [problems, setProblems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [tag, setTag] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [favorites, setFavorites] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);


  useEffect(() => {
    const fetchProblems = async () => {
      setIsFetching(true);
      setFetchError(null);
      try {
        const res = await axiosClient.get(`/problem/getAllProblems?page=1`);
        setProblems(res.data.problems);
        setHasMore(res.data.hasMore);
      } catch (error) {
        setFetchError(error.response?.data?.message || "Unable to load problems.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProblems();
  }, []);

  const loadMore = async () => {
    if (!hasMore) return;

    const nextPage = page + 1;
    setIsFetching(true);
    setFetchError(null);
    try {
      const res = await axiosClient.get(
        `/problem/getAllProblems?page=${nextPage}`
      );
      setProblems(prev => [...prev, ...res.data.problems]);
      setPage(nextPage);
      setHasMore(res.data.hasMore);
    } catch (error) {
      setFetchError(error.response?.data?.message || "Unable to load more problems.");
    } finally {
      setIsFetching(false);
    }
  };

  const tagOptions = useMemo(() => {
    const set = new Set();
    problems.forEach((prob) => {
      const tags = Array.isArray(prob.tags) ? prob.tags : [prob.tags];
      tags.forEach((t) => {
        if (t && typeof t === "string") set.add(t);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [problems]);

  const stats = useMemo(() => {
    const counts = { total: problems.length, easy: 0, medium: 0, hard: 0 };
    problems.forEach((prob) => {
      const level = prob.difficulty?.toLowerCase();
      if (level === "easy") counts.easy += 1;
      if (level === "medium") counts.medium += 1;
      if (level === "hard") counts.hard += 1;
    });
    return counts;
  }, [problems]);

  const filteredProblems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let result = problems.filter((prob) => {
      const matchesQuery = !normalizedQuery || prob.title?.toLowerCase().includes(normalizedQuery);
      const matchesDifficulty = difficulty === "all" || prob.difficulty?.toLowerCase() === difficulty;
      const tags = Array.isArray(prob.tags) ? prob.tags : [prob.tags];
      const matchesTag = tag === "all" || tags.some((t) => t?.toLowerCase() === tag);
      return matchesQuery && matchesDifficulty && matchesTag;
    });

    if (sortBy === "title") {
      result = [...result].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "difficulty") {
      const order = { easy: 1, medium: 2, hard: 3 };
      result = [...result].sort(
        (a, b) => (order[a.difficulty?.toLowerCase()] || 4) - (order[b.difficulty?.toLowerCase()] || 4)
      );
    } else if (sortBy === "favorites") {
      result = [...result].sort((a, b) => (favorites[b._id] ? 1 : 0) - (favorites[a._id] ? 1 : 0));
    }

    return result;
  }, [problems, query, difficulty, tag, sortBy, favorites]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const clearFilters = () => {
    setQuery("");
    setDifficulty("all");
    setTag("all");
    setSortBy("relevance");
  };
  return (
    <>
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />

        <div className="container mx-auto px-5 pt-24 pb-10">
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Problems</h2>
                <p className="text-slate-400">Curated list of challenges to sharpen your DSA skills.</p>
              </div>
              <div className="flex items-center gap-3">
                {user?.role === "admin" && (
                  <button
                    className="btn btn-sm bg-gradient-to-r from-orange-500 to-red-500 text-white border-none hover:from-orange-600 hover:to-red-600"
                    onClick={handleAdmin}
                  >
                    Admin Panel
                  </button>
                )}
                <button
                  className="btn btn-sm bg-slate-900/70 text-slate-300 border-white/10 hover:bg-slate-900/80"
                  onClick={clearFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</div>
                <div className="text-2xl font-semibold">{stats.total}</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Easy</div>
                <div className="text-2xl font-semibold text-emerald-400">{stats.easy}</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Medium</div>
                <div className="text-2xl font-semibold text-amber-400">{stats.medium}</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Hard</div>
                <div className="text-2xl font-semibold text-rose-400">{stats.hard}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Search</label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search problems..."
                  className="mt-2 w-full bg-slate-900/70 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="mt-2 w-full bg-slate-900/70 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
                >
                  <option value="all">All</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Tag</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="mt-2 w-full bg-slate-900/70 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
                >
                  <option value="all">All</option>
                  {tagOptions.map((opt) => (
                    <option key={opt} value={opt.toLowerCase()}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10">
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="mt-2 w-full bg-slate-900/70 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
                >
                  <option value="relevance">Recommended</option>
                  <option value="title">Title</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="favorites">Bookmarks</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              Showing {filteredProblems.length} of {stats.total} problems
            </div>
            {fetchError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {fetchError}
              </div>
            )}
          </div>

          <div className="overflow-hidden bg-slate-900/70 border border-white/10 rounded-xl shadow-sm">
            <table className="table w-full text-left">
              <thead>
                <tr className="bg-slate-900/80 text-slate-500 border-b border-white/10 text-sm uppercase tracking-wider">
                  <th className="py-4 pl-6">Title</th>
                  <th className="py-4">Difficulty</th>
                  <th className="py-4">Tags</th>
                  <th className="py-4">Save</th>
                  <th className="py-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.length > 0 ? (
                  filteredProblems.map((prob) => (
                    <tr
                      key={prob._id}
                      className="border-b border-white/10 hover:bg-slate-950 transition-colors group"
                    >
                      <td className="py-4 pl-6 font-medium text-lg text-white group-hover:text-orange-400 transition-colors">
                        {prob.title}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${prob.difficulty?.toLowerCase() === 'easy'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : prob.difficulty?.toLowerCase() === 'medium'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(prob.tags) ? prob.tags : [prob.tags]).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-xs bg-slate-900/80 text-slate-400 border border-white/10">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => toggleFavorite(prob._id)}
                          className={`h-9 w-9 rounded-full border flex items-center justify-center transition-colors ${favorites[prob._id]
                              ? "border-orange-500/30 bg-orange-500/10 text-orange-300"
                              : "border-white/10 text-slate-500 hover:text-orange-300 hover:border-orange-500/40"
                            }`}
                          title="Bookmark"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill={favorites[prob._id] ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.18v15.183a.75.75 0 0 1-1.241.572L12 17.25l-6.259 4.007a.75.75 0 0 1-1.241-.572V5.502c0-1.103.806-2.052 1.907-2.18a48.507 48.507 0 0 1 11.186 0Z" />
                          </svg>
                        </button>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <button
                          className="btn btn-sm bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-none shadow-sm transition-all font-medium"
                          onClick={() => navigate(`/problem/${prob._id}`)}
                        >
                          Solve Challenge
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-slate-500 py-10 text-lg">
                      {isFetching ? "Loading problems..." : "No problems found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-8">
            {hasMore ? (
              <button
                className="btn btn-outline text-slate-300 hover:bg-slate-900/80 hover:text-white border-slate-700 bg-slate-900/70"
                onClick={loadMore}
                disabled={isFetching}
              >
                {isFetching ? "Loading..." : "Load More Problems"}
              </button>
            ) : (
              <p className="text-slate-500 text-sm">You have reached the end of the list.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
