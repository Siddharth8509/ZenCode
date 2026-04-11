import React from "react";
import {
    ArrowLeftIcon,
    DocumentTextIcon,
    EyeIcon,
    BuildingOffice2Icon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const MockPapers = () => {
    const navigate = useNavigate();

    const DRIVE_URL = "https://drive.google.com/drive/folders/1GECtnwT9XmP21s5VGW65ux8wMrI0B4Uz?dmr=1&ec=wgc-drive-%5Bmodule%5D-goto";

    const HARDCODED_PAPERS = [
        {
            id: 1,
            title: "Practice and Learn from Company Wise Papers Mock Papers",
            company: "ZenCode",
            category: "Practice/Exam Prep"
        }
    ];

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
                            Access our centralized Google Drive vault for all placement and mock papers.
                        </p>
                    </div>
                </div>

                {/* ================= TABLE ================= */}
                <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">

                            {/* TABLE HEAD */}
                            <thead className="bg-neutral-900/80 border-b border-white/10 text-xs uppercase text-neutral-400 tracking-wider">
                                <tr>
                                    <th className="p-5 text-left font-semibold">Resource Name</th>
                                    <th className="p-5 text-left font-semibold">Provider</th>
                                    <th className="p-5 text-left font-semibold">Category</th>
                                    <th className="p-5 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>

                            {/* TABLE BODY */}
                            <tbody className="divide-y divide-white/10">
                                {HARDCODED_PAPERS.map((p) => (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">

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
                                                <button
                                                    onClick={() => window.open(DRIVE_URL, '_blank')}
                                                    title="View on Google Drive"
                                                    className="p-3 border border-white/10 rounded-xl bg-neutral-900 text-neutral-400 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 hover:text-white hover:border-transparent transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transform hover:-translate-y-0.5"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="text-center mt-6">
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                        ZenCode Mock Vault • Hosted on Google Drive
                    </p>
                </div>

            </div>
        </div>
    );
};

export default MockPapers;
