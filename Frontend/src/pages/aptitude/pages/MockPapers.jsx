import React, { useEffect, useState } from "react";
import axios from "../../../utils/axiosClient";
import {
    MagnifyingGlassIcon,
    ArrowLeftIcon,
    DocumentTextIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    BuildingOffice2Icon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const MockPapers = () => {
    const navigate = useNavigate();

    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const BASE_URL = "/aptitude";

    /* ---------------- FETCH ---------------- */
    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/pdfs`);
                setPdfs(res.data);
            } catch {
                toast.error("Failed to load mock papers");
            } finally {
                setLoading(false);
            }
        };

        fetchPdfs();
    }, []);

    /* ---------------- SEARCH ---------------- */
    const filteredPdfs = pdfs.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /* ---------------- DOWNLOAD ---------------- */
    const handleDownload = (url, name) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = name || "mock-paper.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4">
            <div className="max-w-[1400px] mx-auto pt-6">

                {/* ================= HEADER ================= */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

                    <div>
                        <button
                            onClick={() => navigate('/aptitude')}
                            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors font-semibold text-sm mb-2"
                        >
                            <ArrowLeftIcon className="w-4 h-4" /> Back to Hub
                        </button>

                        <h1 className="text-4xl font-semibold tracking-tight text-white">
                            Mock Test <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Papers</span>
                        </h1>

                        <p className="text-sm text-neutral-400 mt-2">
                            Company-wise placement papers
                        </p>
                    </div>

                    {/* SEARCH */}
                    <div className="relative w-full md:w-80">
                        <MagnifyingGlassIcon
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5"
                        />
                        <input
                            type="text"
                            placeholder="Search company or paper..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-neutral-900/60 text-sm font-medium text-white placeholder-neutral-500 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                        />
                    </div>

                </div>

                {/* ================= TABLE ================= */}
                <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">

                    {loading ? (
                        <div className="py-24 flex flex-col items-center gap-4">
                            <span className="loading loading-spinner text-red-500 loading-lg"></span>
                            <p className="text-sm font-semibold text-neutral-400">
                                Loading Papers...
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">

                                {/* TABLE HEAD */}
                                <thead className="bg-neutral-900/80 border-b border-white/10 text-xs uppercase text-neutral-400 tracking-wider">
                                    <tr>
                                        <th className="p-5 text-left font-semibold">Paper</th>
                                        <th className="p-5 text-left font-semibold">Company</th>
                                        <th className="p-5 text-left font-semibold">Category</th>
                                        <th className="p-5 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>

                                {/* TABLE BODY */}
                                <tbody className="divide-y divide-white/10">

                                    {filteredPdfs.length > 0 ? (
                                        filteredPdfs.map((p) => (
                                            <tr key={p._id} className="hover:bg-white/5 transition-colors group">

                                                {/* TITLE */}
                                                <td className="p-5 font-semibold text-white align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-shrink-0 items-center justify-center text-red-400 group-hover:scale-105 group-hover:border-red-500/40 transition-all">
                                                          <DocumentTextIcon className="w-5 h-5" />
                                                        </div>
                                                        <span className="group-hover:text-red-300 transition-colors">{p.title}</span>
                                                    </div>
                                                </td>

                                                {/* COMPANY */}
                                                <td className="p-5 text-neutral-300 font-semibold align-middle">
                                                    <div className="flex items-center gap-2">
                                                      <BuildingOffice2Icon className="w-4 h-4 text-neutral-500 max-w-fit" />
                                                      {p.company}
                                                    </div>
                                                </td>

                                                {/* CATEGORY */}
                                                <td className="p-5 align-middle">
                                                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold tracking-widest text-neutral-300 uppercase">
                                                        {p.category}
                                                    </span>
                                                </td>

                                                {/* ACTIONS */}
                                                <td className="p-5 text-center align-middle">
                                                    <div className="flex justify-center gap-2">

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
                                                            className="p-2 border border-white/10 rounded-xl bg-neutral-900 text-neutral-400 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 hover:text-white hover:border-transparent transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transform hover:-translate-y-0.5"
                                                        >
                                                            <ArrowDownTrayIcon className="w-4 h-4" />
                                                        </button>


                                                    </div>
                                                </td>

                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-40">
                                                    <DocumentTextIcon className="w-12 h-12 text-neutral-500" />
                                                    <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                                                        No papers found
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                </tbody>
                            </table>
                        </div>
                    )}

                </div>

                {/* FOOTER */}
                <div className="text-center mt-6">
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                        ZenCode Mock Vault • Placement Papers
                    </p>
                </div>

            </div>
        </div>
    );
};

export default MockPapers;
