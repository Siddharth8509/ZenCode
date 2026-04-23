import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { PlusIcon, TrashIcon, DocumentIcon } from '@heroicons/react/24/outline';
import axiosClient from '../../utils/axiosClient';

const LearningAdmin = () => {
    const navigate = useNavigate();
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPdfs = async () => {
        try {
            const res = await axiosClient.get('/learning/api/pdfs');
            setPdfs(res.data.pdfs || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load PDFs.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPdfs();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this PDF?")) return;
        
        try {
            await axiosClient.delete(`/learning/api/pdfs/${id}`);
            toast.success("PDF deleted successfully");
            fetchPdfs();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete PDF");
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-black text-white p-6 md:p-10">
            <div className="max-w-6xl mx-auto mt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                            Learning Admin Panel
                        </h1>
                        <p className="text-neutral-400 mt-2">Manage study materials and PDFs for the Learning section.</p>
                    </div>
                    <button
                        onClick={() => navigate('/learning/upload')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Upload New PDF
                    </button>
                </div>

                <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-10 flex justify-center">
                            <span className="loading loading-spinner text-emerald-500 loading-lg"></span>
                        </div>
                    ) : pdfs.length === 0 ? (
                        <div className="p-10 text-center text-neutral-500">
                            No PDFs uploaded yet. Click the button above to add one.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 border-b border-white/10 text-neutral-400">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Title</th>
                                        <th className="px-6 py-4 font-semibold">Subject</th>
                                        <th className="px-6 py-4 font-semibold">Date Added</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pdfs.map((pdf) => (
                                        <tr key={pdf._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                                        <DocumentIcon className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-semibold text-neutral-200">{pdf.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-white/10 rounded-md text-xs font-bold uppercase tracking-wider text-neutral-300">
                                                    {pdf.subject}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-400">
                                                {new Date(pdf.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(pdf._id)}
                                                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    title="Delete PDF"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
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

export default LearningAdmin;
