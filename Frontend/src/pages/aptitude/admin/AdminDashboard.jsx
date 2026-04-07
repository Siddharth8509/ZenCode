import React, { useState, useEffect } from "react";
import axios from "../../../utils/axiosClient";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  PencilSquareIcon,
  Squares2X2Icon,
  VideoCameraIcon,
  PlayCircleIcon,
  BuildingOffice2Icon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [viewMode, setViewMode] = useState("questions");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const BASE_URL = "/aptitude";

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= FETCH ================= */

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, lRes, pRes] = await Promise.all([
        axios.get(`${BASE_URL}/questions`),
        axios.get(`${BASE_URL}/learn`),
        axios.get(`${BASE_URL}/pdfs`)
      ]);

      setQuestions(qRes.data);
      setLectures(lRes.data);
      setPdfs(pRes.data);
    } catch {
      toast.error("Failed to sync database");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;

    await axios.delete(`${BASE_URL}/questions/${id}`);
    setQuestions(questions.filter((q) => q._id !== id));

    toast.success("Question deleted");
  };

  const handleDeleteLecture = async (id) => {
    if (!window.confirm("Delete this lecture?")) return;

    await axios.delete(`${BASE_URL}/learn/${id}`);
    setLectures(lectures.filter((l) => l._id !== id));

    toast.success("Lecture deleted");
  };

  const handleDeletePdf = async (id) => {
    if (!window.confirm("Delete this PDF?")) return;

    await axios.delete(`${BASE_URL}/pdfs/${id}`);
    setPdfs(pdfs.filter((p) => p._id !== id));

    toast.success("PDF deleted");
  };

  /* ================= FILTERS ================= */

  const filteredQuestions = questions.filter(
    (q) =>
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.company &&
        q.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredLectures = lectures.filter(
    (l) =>
      l.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPdfs = pdfs.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const matchCount =
    viewMode === "questions"
      ? filteredQuestions.length
      : viewMode === "lectures"
        ? filteredLectures.length
        : filteredPdfs.length;

  return (
    <div className="min-h-screen bg-black p-3 text-white">
      <div className="max-w-[1400px] mx-auto">

        {/* ================= HEADER ================= */}

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-2xl font-black text-white">
              Command Center
            </h1>

            {/* VIEW MODES */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  setViewMode("questions");
                  setSearchTerm("");
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${viewMode === "questions"
                  ? "bg-amber-500 text-black border border-transparent shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                  : "bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10"
                  }`}
              >
                Questions ({questions.length})
              </button>

              <button
                onClick={() => {
                  setViewMode("lectures");
                  setSearchTerm("");
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${viewMode === "lectures"
                  ? "bg-amber-500 text-black border border-transparent shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                  : "bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10"
                  }`}
              >
                Lectures ({lectures.length})
              </button>

              <button
                onClick={() => {
                  setViewMode("pdfs");
                  setSearchTerm("");
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${viewMode === "pdfs"
                  ? "bg-amber-500 text-black border border-transparent shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                  : "bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10"
                  }`}
              >
                Mock PDFs ({pdfs.length})
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS */}

          <div className="flex gap-2">
            <Link
              to="/aptitude/admin/add-lecture"
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-sm font-bold text-white hover:bg-white/5 transition-all"
            >
              <VideoCameraIcon className="w-4 h-4 text-orange-400" /> Lecture
            </Link>

            <Link
              to="/aptitude/admin/add"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white border border-transparent rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all"
            >
              <PlusIcon className="w-4 h-4" /> Question
            </Link>

            <Link
              to="/aptitude/admin/upload-pdf"
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-sm font-bold text-white hover:bg-white/5 transition-all"
            >
              <DocumentTextIcon className="w-4 h-4 text-orange-400" /> Upload PDF
            </Link>
          </div>
        </div>

        {/* ================= SEARCH ================= */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mb-3">
          <div className="lg:col-span-3 relative">
            <MagnifyingGlassIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5"
            />

            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-sm font-semibold outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 placeholder-neutral-500 text-white"
            />
          </div>

          <div className="bg-neutral-900 text-amber-500 rounded-lg border border-white/10 p-2 flex items-center justify-center gap-2 text-sm font-bold">
            <Squares2X2Icon className="w-5 h-5" />
            {matchCount} Matches
          </div>
        </div>

        {/* ================= TABLE ================= */}

        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <span className="loading loading-spinner text-amber-500 loading-lg"></span>
              <p className="text-xs font-bold text-neutral-500">
                Loading Data...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                {/* HEADER */}

                <thead className="bg-neutral-900/80 border-b border-white/10 text-xs uppercase text-neutral-400 tracking-wider">
                  {viewMode === "questions" ? (
                    <tr>
                      <th className="p-4 text-left font-semibold">Question</th>
                      <th className="p-4 text-left font-semibold">Topic</th>
                      <th className="p-4 text-left font-semibold">Company</th>
                      <th className="p-4 text-center font-semibold">Actions</th>
                    </tr>
                  ) : viewMode === "lectures" ? (
                    <tr>
                      <th className="p-4 text-left font-semibold">Lecture</th>
                      <th className="p-4 text-left font-semibold">Description</th>
                      <th className="p-4 text-center font-semibold">Duration</th>
                      <th className="p-4 text-center font-semibold">Action</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="p-4 text-left font-semibold">Title</th>
                      <th className="p-4 text-left font-semibold">Company</th>
                      <th className="p-4 text-left font-semibold">Category</th>
                      <th className="p-4 text-center font-semibold">Action</th>
                    </tr>
                  )}
                </thead>

                {/* BODY */}

                <tbody className="divide-y divide-white/5">

                  {/* QUESTIONS */}

                  {viewMode === "questions" &&
                    filteredQuestions.map((q) => (
                      <tr key={q._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 max-w-md">
                          <p className="font-semibold line-clamp-2 text-white">
                            {q.questionText}
                          </p>
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-1 bg-white/10 rounded text-xs font-bold text-neutral-300">
                            {q.topic}
                          </span>
                        </td>

                        <td className="p-4 font-semibold text-neutral-400">
                          <BuildingOffice2Icon className="w-4 h-4 inline mr-1 text-neutral-500" />
                          {q.company || "General"}
                        </td>

                        <td className="p-4 text-center align-middle">
                          <div className="flex justify-center gap-2">
                            <Link
                              to={`/aptitude/admin/edit/${q._id}`}
                              className="p-2 border border-white/10 text-neutral-400 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleDeleteQuestion(q._id)}
                              className="p-2 border border-white/10 text-neutral-400 rounded-lg hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {/* LECTURES */}

                  {viewMode === "lectures" &&
                    filteredLectures.map((l) => (
                      <tr key={l._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-semibold text-white">
                          <PlayCircleIcon className="w-5 h-5 inline mr-2 text-orange-400" />
                          {l.topic}
                        </td>

                        <td className="p-4 text-xs italic line-clamp-2 text-neutral-400">
                          {l.description}
                        </td>

                        <td className="p-4 text-center font-bold text-neutral-300 tabular-nums">
                          {l.duration}
                        </td>

                        <td className="p-4 text-center align-middle">
                          <button
                            onClick={() => handleDeleteLecture(l._id)}
                            className="p-2 border border-white/10 text-neutral-400 rounded-lg hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                  {/* PDFS */}

                  {viewMode === "pdfs" &&
                    filteredPdfs.map((p) => (
                      <tr key={p._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5 text-neutral-500" />
                            <span className="line-clamp-1">{p.title}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-1 text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded text-xs font-bold uppercase tracking-widest">
                            {p.company}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-1 text-neutral-300 bg-white/5 border border-white/10 rounded text-xs font-bold uppercase tracking-widest">
                            {p.category}
                          </span>
                        </td>

                        <td className="p-4 text-center align-middle">
                          <div className="flex justify-center gap-2">

                            {/* EDIT */}
                            <Link
                              to={`/aptitude/admin/edit-pdf/${p._id}`}
                              title="Edit"
                              className="p-2 border border-white/10 text-neutral-400 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </Link>

                            {/* DELETE */}
                            <button
                              onClick={() => handleDeletePdf(p._id)}
                              title="Delete"
                              className="p-2 border border-white/10 text-neutral-400 rounded-lg hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>

                            {/* DOWNLOAD */}
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(p.pdfUrl);
                                  const blob = await res.blob();

                                  const url = window.URL.createObjectURL(blob);

                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.download = `${p.title}.pdf`;
                                  document.body.appendChild(link);
                                  link.click();

                                  link.remove();
                                  window.URL.revokeObjectURL(url);
                                } catch (err) {
                                  alert("Download failed");
                                }
                              }}
                              title="Download"
                              className="p-2 border border-white/10 text-neutral-400 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
