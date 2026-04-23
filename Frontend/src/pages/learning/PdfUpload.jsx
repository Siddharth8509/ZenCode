import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';
import axiosClient from '../../utils/axiosClient';

const SUBJECT_OPTIONS = [
  { label: 'Operating Systems', value: 'OS' },
  { label: 'Database Management Systems', value: 'DBMS' },
  { label: 'Computer Networks', value: 'CN' },
  { label: 'Other', value: 'Other' },
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.error?.message ||
  error.message ||
  'Failed to upload PDF';

const isPdfFile = (selectedFile) =>
  Boolean(
    selectedFile &&
    (selectedFile.type === 'application/pdf' ||
      selectedFile.name?.toLowerCase().endsWith('.pdf'))
  );

const PdfUpload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', subject: 'OS' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!isPdfFile(selectedFile)) {
      event.target.value = '';
      toast.error('Please choose a valid PDF file.');
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      event.target.value = '';
      toast.error('PDF must be smaller than 25 MB.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle || !formData.subject || !file) {
      toast.error('All fields are required.');
      return;
    }

    if (!isPdfFile(file)) {
      toast.error('Please choose a valid PDF file.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const { data: signData } = await axiosClient.get('/learning/api/pdfs/sign', {
        params: { folder: 'learning_pdfs' },
      });

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('api_key', signData.api_key);
      cloudinaryFormData.append('timestamp', signData.timestamp);
      cloudinaryFormData.append('signature', signData.signature);
      cloudinaryFormData.append('folder', signData.folder);

      const { data: cloudinaryResponse } = await axios.post(
        `https://api.cloudinary.com/v1_1/${signData.cloud_name}/raw/upload`,
        cloudinaryFormData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: false,
          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        }
      );

      const pdfUrl = cloudinaryResponse.secure_url || cloudinaryResponse.url;
      if (!pdfUrl) {
        throw new Error('Cloudinary did not return a usable PDF URL.');
      }

      await axiosClient.post('/learning/api/pdfs', {
        title: trimmedTitle,
        subject: formData.subject,
        pdfUrl,
      });

      setUploadProgress(100);
      toast.success('PDF uploaded successfully!');
      navigate('/learning/admin');
    } catch (error) {
      console.error('Learning PDF upload error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black text-white p-6 md:p-10">
      <div className="max-w-2xl mx-auto mt-10 p-8 glass-panel border border-white/10 rounded-2xl">
        <button
          onClick={() => navigate('/learning/admin')}
          className="mb-6 flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Admin Panel
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <CloudArrowUpIcon className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Upload Study Material</h1>
            <p className="text-sm text-neutral-400">Add a new PDF to the Learning module</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Document Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. OS Memory Management Notes"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Subject</label>
            <select
              value={formData.subject}
              onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              disabled={loading}
            >
              {SUBJECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">PDF File</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 rounded-xl cursor-pointer bg-black/30 hover:bg-white/5 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <DocumentIcon className="w-10 h-10 text-emerald-400 mb-3" />
                      <p className="mb-2 text-sm text-white font-medium">{file.name}</p>
                      <p className="text-xs text-neutral-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-10 h-10 text-neutral-400 mb-3" />
                      <p className="mb-2 text-sm text-neutral-400">
                        <span className="font-semibold text-emerald-400">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-neutral-500">PDF only, up to 25 MB</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                  required
                />
              </label>
            </div>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-neutral-400">
                <span>Uploading to cloud</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:shadow-none"
          >
            {loading ? 'Uploading Document...' : 'Upload Material'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PdfUpload;
