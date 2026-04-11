import React, { useState, useEffect } from "react";
import axios from "../../../utils/axiosClient";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronLeftIcon, ArrowUpTrayIcon, ArrowPathIcon, PhotoIcon } from "@heroicons/react/24/outline";

const AdminEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const BASE_URL = "/aptitude";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/questions/${id}`);
                setFormData(res.data);
            } catch {
                toast.error("Failed to load question");
            }
        };
        fetchData();
    }, [id]);

    const handleOptionChange = (i, val) => {
        const newOpts = [...formData.options];
        newOpts[i] = val;
        setFormData({ ...formData, options: newOpts });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.options.some((opt) => opt.trim() === "")) {
            return toast.error("Fill all options");
        }

        const loading = toast.loading("Saving Changes...");
        setIsUploading(true);

        try {
            let finalImageUrl = formData.imageUrl;

            // 1. If new file selected, upload to Cloudinary
            if (file) {
                const { data: sigData } = await axios.get(`/aptitude/pdfs/sign?folder=aptitude_questions`);
                const { signature, timestamp, api_key, cloud_name, folder } = sigData;

                const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;

                const formDataToCloudinary = new FormData();
                formDataToCloudinary.append("file", file);
                formDataToCloudinary.append("api_key", api_key);
                formDataToCloudinary.append("timestamp", timestamp);
                formDataToCloudinary.append("signature", signature);
                formDataToCloudinary.append("folder", folder);

                const { data: cloudinaryResponse } = await axios.post(cloudinaryUrl, formDataToCloudinary, {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: false,
                });

                finalImageUrl = cloudinaryResponse.secure_url;
            }

            // 2. Update Backend
            const payload = {
                ...formData,
                imageUrl: finalImageUrl
            };

            await axios.put(`${BASE_URL}/questions/${id}`, payload);

            toast.dismiss(loading);
            toast.success("Question Updated 🚀");
            setTimeout(() => navigate('/aptitude/admin'), 1200);
        } catch (err) {
            toast.dismiss(loading);
            console.error("Update failed", err);
            toast.error("Update failed");
        } finally {
            setIsUploading(false);
        }
    };

    if (!formData)
        return (
            <div className="h-screen flex items-center justify-center bg-black text-white">
                <div className="glass-panel px-6 py-3 rounded-2xl border border-white/10 animate-pulse">
                    Syncing data...
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-black p-3 text-white transition-opacity duration-500 animate-in fade-in">
            <div className="max-w-[1700px] mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6 mt-2">
                    <button
                        onClick={() => navigate('/aptitude/admin')}
                        className="flex items-center gap-2 text-neutral-400 hover:text-white font-semibold transition-colors"
                    >
                        <ChevronLeftIcon className="w-5 h-5" /> Back
                    </button>

                    <button
                        form="edit-form"
                        type="submit"
                        disabled={isUploading}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 rounded-xl font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <ArrowUpTrayIcon className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>

                <form id="edit-form" onSubmit={handleSubmit} className="space-y-4">

                    {/* QUESTION */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/10">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                            Question Content
                        </label>

                        <textarea
                            rows={3}
                            value={formData.questionText}
                            className="w-full mt-2 p-4 rounded-xl border border-white/5 bg-neutral-900 placeholder-neutral-500 text-white font-medium outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none"
                            placeholder="Type question text here..."
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, questionText: e.target.value })
                            }
                        />
                    </div>

                    {/* OPTIONS */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {formData.options.map((opt, i) => (
                            <div key={i} className="relative">
                                <span className="absolute left-3 top-3.5 text-xs font-black text-amber-500/50">
                                    {String.fromCharCode(65 + i)}
                                </span>
                                <input
                                    type="text"
                                    value={opt}
                                    className="w-full pl-8 pr-3 py-3 rounded-xl border border-white/5 bg-neutral-900 font-semibold text-white outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                                    required
                                    onChange={(e) => handleOptionChange(i, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* META FIELDS */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        <input
                            type="text"
                            value={formData.topic}
                            placeholder="Topic"
                            className="p-3 rounded-xl border border-white/5 bg-neutral-900 font-semibold text-white outline-none focus:ring-1 focus:ring-orange-500/50 transition-all"
                            required
                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        />

                        <input
                            type="text"
                            value={formData.company || ""}
                            placeholder="Company"
                            className="p-3 rounded-xl border border-white/5 bg-neutral-900 font-semibold text-white outline-none focus:ring-1 focus:ring-orange-500/50 transition-all"
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />

                        <select
                            className="p-3 rounded-xl border border-white/5 bg-neutral-900 font-semibold text-white outline-none"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option>Quantitative</option>
                            <option>Logical</option>
                            <option>Verbal</option>
                        </select>

                        <select
                            className="p-3 rounded-xl border border-white/5 bg-neutral-900 font-semibold text-white outline-none"
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        >
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>

                        <input
                            type="text"
                            value={formData.correctAnswer}
                            placeholder="Correct Answer"
                            className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 font-bold text-amber-500 outline-none"
                            required
                            onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                        />
                    </div>

                    {/* BOTTOM SECTION */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* SOLUTION */}
                        <div className="glass-panel p-5 rounded-2xl border border-white/10">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                                Detailed Solution
                            </label>
                            <textarea
                                rows={5}
                                value={formData.solution}
                                className="w-full mt-2 p-4 rounded-xl border border-white/5 bg-neutral-900 text-white font-medium outline-none focus:ring-1 focus:ring-orange-500/50 transition-all resize-none"
                                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                            />
                        </div>

                        {/* VISUALS */}
                        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-4">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest w-full">
                                Update Visual
                            </label>

                            <div className="w-full h-full min-h-[120px] border border-dashed border-white/20 rounded-xl bg-neutral-900/50 flex flex-col items-center justify-center p-4">
                                {file ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <PhotoIcon className="w-10 h-10 text-orange-500" />
                                        <p className="text-sm font-bold text-white truncate max-w-[200px]">
                                            {file.name}
                                        </p>
                                    </div>
                                ) : formData.imageUrl ? (
                                    <div className="relative group">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Current"
                                            className="max-h-32 rounded-lg border border-white/10 shadow-lg group-hover:opacity-50 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <PhotoIcon className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <PhotoIcon className="w-8 h-8 text-neutral-700" />
                                )}

                                <label className="cursor-pointer mt-4 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
                                    <ArrowPathIcon className="w-4 h-4" /> Replace Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AdminEdit;

