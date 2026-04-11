import React, { useState } from "react";
import axios from "../../../utils/axiosClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronLeftIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

const AdminPdfUpload = () => {
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        company: "",
        category: "Mock Test"
    });

    const BASE_URL = "/aptitude";

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) return toast.error("Please select a PDF");

        const loading = toast.loading("Uploading PDF...");

        try {
            setIsUploading(true);
            setUploadProgress(0);

            // 1. Get signature from backend
            const { data: signData } = await axios.get(`${BASE_URL}/pdfs/sign`);
            const { signature, timestamp, api_key, cloud_name, folder } = signData;

            // 2. Upload directly to Cloudinary
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`;
            
            const formDataToCloudinary = new FormData();
            formDataToCloudinary.append("file", file);
            formDataToCloudinary.append("api_key", api_key);
            formDataToCloudinary.append("timestamp", timestamp);
            formDataToCloudinary.append("signature", signature);
            formDataToCloudinary.append("folder", folder);
            
            const { data: cloudinaryResponse } = await axios.post(cloudinaryUrl, formDataToCloudinary, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: false, 
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(progress);
                },
            });

            // 3. Send the resulting URL to your backend
            await axios.post(`${BASE_URL}/pdfs/upload`, {
                title: formData.title,
                company: formData.company,
                category: formData.category,
                pdfUrl: cloudinaryResponse.secure_url,
            });

            toast.dismiss(loading);
            setIsUploading(false);
            toast.success("PDF Uploaded 🚀");

            setTimeout(() => navigate('/aptitude/admin'), 1200);

        } catch (error) {
            console.error("PDF Upload Error:", error);
            toast.dismiss(loading);
            setIsUploading(false);
            setUploadProgress(0);
            toast.error("Upload failed");
        }
    };

    return (
        <div className="min-h-screen bg-black p-3 text-white">
            <div className="max-w-[1200px] mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6 mt-2">
                    <button
                        onClick={() => navigate('/aptitude/admin')}
                        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors font-semibold"
                    >
                        <ChevronLeftIcon className="w-5 h-5" /> Back
                    </button>

                    <button
                        form="pdf-form"
                        type="submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 rounded-xl font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5" /> Upload
                    </button>
                </div>

                <form id="pdf-form" onSubmit={handleSubmit} className="space-y-4">

                    {/* TITLE */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/10">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                            PDF Title
                        </label>

                        <textarea
                            rows={2}
                            placeholder="TCS Mock Test Paper 2025"
                            className="w-full mt-2 p-4 rounded-xl border border-white/5 bg-neutral-900 font-semibold placeholder-neutral-600 text-white resize-none outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                        />
                    </div>

                    {/* META */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">

                        <input
                            type="text"
                            placeholder="Company (TCS, Infosys...)"
                            className="p-3 rounded-xl border border-white/5 bg-neutral-900 font-semibold placeholder-neutral-600 text-white outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, company: e.target.value })
                            }
                        />

                        <select
                            className="p-3 rounded-xl border border-white/5 bg-neutral-900 font-semibold text-white outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                            value={formData.category}
                            onChange={(e) =>
                                setFormData({ ...formData, category: e.target.value })
                            }
                        >
                            <option>Mock Test</option>
                            <option>Previous Year Paper</option>
                            <option>Sample Paper</option>
                        </select>

                        <div className="text-sm font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 flex items-center justify-center">
                            Only PDF files allowed
                        </div>
                    </div>

                    {/* FILE UPLOAD */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-center">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                            Attach PDF
                        </label>

                        <div className="mt-2 p-5 border border-dashed border-white/20 rounded-xl bg-neutral-900/50 text-center flex flex-col items-center justify-center">
                            {file ? (
                                <p className="text-sm font-semibold text-orange-400 truncate max-w-xs mb-2">
                                    Selected: {file.name}
                                </p>
                            ) : (
                                <p className="text-xs text-neutral-500 mb-2">
                                    Upload company-wise mock test paper
                                </p>
                            )}

                            <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2 rounded-lg text-sm font-bold transition-colors">
                                Browse File
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>
                    </div>

                    {/* PROGRESS BAR */}
                    {isUploading && (
                        <div className="glass-panel p-5 rounded-2xl border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                                    Uploading...
                                </span>
                                <span className="text-sm font-mono font-bold text-white">
                                    {uploadProgress}%
                                </span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                                <div 
                                    className="bg-gradient-to-r from-orange-400 to-red-500 h-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
};

export default AdminPdfUpload;
