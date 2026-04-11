import React, { useState } from "react";
import axios from "../../../utils/axiosClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronLeftIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

const AdminUpload = () => {
    const navigate = useNavigate();

    const [file, setFile] = useState(null);

    const [formData, setFormData] = useState({
        questionText: "",
        topic: "",
        category: "Quantitative",
        difficulty: "Medium",
        correctAnswer: "",
        solution: "",
        company: "",
        options: ["", "", "", ""],
    });

    const BASE_URL = "/aptitude";

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

        const answerExists = formData.options.some(
            (opt) =>
                opt.trim().toLowerCase() ===
                formData.correctAnswer.trim().toLowerCase()
        );

        if (!answerExists) {
            return toast.error("Correct answer must match one option");
        }

        const loading = toast.loading("Uploading Question...");
 
        try {
            let imageUrl = "";
 
            // 1. Direct Cloudinary Upload if file exists
            if (file) {
                // Get Signature for 'aptitude_questions' folder
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
                    withCredentials: false
                });
 
                imageUrl = cloudinaryResponse.secure_url;
            }
 
            // 2. Post Data to Backend
            const finalData = { 
                ...formData,
                imageUrl 
            };
 
            await axios.post(`${BASE_URL}/questions/add`, finalData);
 
            toast.dismiss(loading);
            toast.success("Question Added 🚀");
            setTimeout(() => navigate('/aptitude/admin'), 1200);
        } catch (err) {
            toast.dismiss(loading);
            console.error("Upload failed", err);
            toast.error("Upload failed");
        }
    };

    return (
        <div className="min-h-screen bg-black p-3 text-white">
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
                        form="upload-form"
                        type="submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 rounded-xl font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5" /> Upload
                    </button>
                </div>

                <form id="upload-form" onSubmit={handleSubmit} className="space-y-4">

                    {/* QUESTION */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/10">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                            Question
                        </label>

                        <textarea
                            placeholder="Enter question..."
                            rows={2}
                            className="w-full mt-2 p-4 rounded-xl border border-white/5 bg-neutral-900 placeholder-neutral-500 text-white font-medium outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, questionText: e.target.value })
                            }
                        />
                    </div>

                    {/* OPTIONS */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {formData.options.map((opt, i) => (
                            <input
                                key={i}
                                type="text"
                                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                className="p-3 rounded-xl border border-white/5 bg-neutral-900 font-semibold placeholder-neutral-500 text-white outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                                required
                                onChange={(e) => handleOptionChange(i, e.target.value)}
                            />
                        ))}
                    </div>

                    {/* META FIELDS */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">

                        <input
                            type="text"
                            placeholder="Topic (e.g. Ratio)"
                            className="p-3 rounded-xl border border-white/5 bg-neutral-900 font-semibold placeholder-neutral-500 text-white outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, topic: e.target.value })
                            }
                        />

                        <input
                            type="text"
                            placeholder="Company (optional)"
                            className="p-3 rounded-xl border border-white/5 bg-neutral-900 font-semibold placeholder-neutral-500 text-white outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                            onChange={(e) =>
                                setFormData({ ...formData, company: e.target.value })
                            }
                        />

                        <select
                            className="p-3 rounded-xl border border-white/5 bg-neutral-900 font-semibold text-white outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                            value={formData.category}
                            onChange={(e) =>
                                setFormData({ ...formData, category: e.target.value })
                            }
                        >
                            <option>Quantitative</option>
                            <option>Logical</option>
                            <option>Verbal</option>
                        </select>

                        <select
                            className="p-3 rounded-xl border border-white/5 bg-neutral-900 font-semibold text-white outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                            value={formData.difficulty}
                            onChange={(e) =>
                                setFormData({ ...formData, difficulty: e.target.value })
                            }
                        >
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Correct Answer"
                            className="p-3 rounded-xl border border-white/5 bg-amber-500/10 font-bold placeholder-amber-500/50 text-amber-500 outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                            required
                            onChange={(e) =>
                                setFormData({ ...formData, correctAnswer: e.target.value })
                            }
                        />
                    </div>

                    {/* BOTTOM */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* SOLUTION */}
                        <div className="glass-panel p-5 rounded-2xl border border-white/10">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                                Solution / Explanation
                            </label>

                            <textarea
                                rows={4}
                                placeholder="Step-by-step solution..."
                                className="w-full mt-2 p-4 rounded-xl border border-white/5 bg-neutral-900 placeholder-neutral-500 text-white font-medium outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                                required
                                onChange={(e) =>
                                    setFormData({ ...formData, solution: e.target.value })
                                }
                            />
                        </div>

                        {/* IMAGE */}
                        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-center">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                                Attach Visual
                            </label>

                            <div className="mt-2 p-4 border border-dashed border-white/20 rounded-xl bg-neutral-900/50 text-center flex flex-col items-center justify-center">
                                {file ? (
                                    <p className="text-sm font-semibold text-amber-500 truncate max-w-xs">
                                        Selected: {file.name}
                                    </p>
                                ) : (
                                    <p className="text-xs text-neutral-500 mb-2">
                                        Best for Graphs or Tables
                                    </p>
                                )}

                                <label className="cursor-pointer mt-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                                    Browse File
                                    <input
                                        type="file"
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

export default AdminUpload;
