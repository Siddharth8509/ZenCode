import React, { useState } from "react";
import axios from "../../../utils/axiosClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { VideoCameraIcon, ArrowLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

const AddLecture = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    topic: "",
    category: "Quantitative",
    videoUrl: "",
    description: "",
    duration: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `/aptitude/learn`,
        formData
      );

      toast.success("New Lecture added to Vault!");
      navigate('/aptitude/admin');
    } catch (err) {
      toast.error(
        "Failed to upload lecture: " +
        (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="min-h-screen bg-black p-3 text-white">

      {/* WIDE CONTAINER */}
      <div className="max-w-[1400px] mx-auto glass-panel rounded-2xl p-6 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.8)]">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors font-bold text-xs uppercase mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </button>

        {/* TITLE */}
        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <VideoCameraIcon className="w-6 h-6 text-orange-400" /> New Master Lecture
        </h2>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* TOP ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* TOPIC */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                Topic Name
              </label>
              <textarea
                required
                rows={1}
                className="w-full p-3 bg-neutral-900 rounded-xl border border-white/5 text-white font-medium outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 resize-none text-sm transition-all"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
              />
            </div>

            {/* DURATION */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                Duration (Min)
              </label>
              <input
                required
                placeholder="e.g. 15:20"
                className="w-full p-3 bg-neutral-900 rounded-xl border border-white/5 text-white font-medium outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 text-sm transition-all"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
              />
            </div>

          </div>

          {/* VIDEO URL */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
              YouTube Video URL
            </label>
            <textarea
              required
              rows={2}
              className="w-full p-3 bg-neutral-900 rounded-xl border border-white/5 text-white font-medium outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 resize-none text-sm transition-all"
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData({ ...formData, videoUrl: e.target.value })
              }
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
              Concept Description
            </label>
            <textarea
              required
              rows={3}
              className="w-full p-3 bg-neutral-900 rounded-xl border border-white/5 text-white font-medium outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 resize-none text-sm transition-all"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-red-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] text-white rounded-xl font-bold transition-all flex items-center gap-2 uppercase text-[10px] tracking-widest transform hover:-translate-y-0.5"
            >
              <PaperAirplaneIcon className="w-4 h-4" /> Push to Platform
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddLecture;
