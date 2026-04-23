import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  BuildingOffice2Icon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  FolderIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import axiosClient from "../../../utils/axiosClient";

const buildViewerUrl = (pdfUrl) =>
  pdfUrl?.includes("#") ? pdfUrl : `${pdfUrl}#toolbar=1&navpanes=0&view=FitH`;

const PDF_ISSUE_MESSAGES = {
  cloudinaryAcl:
    "This PDF is blocked by your Cloudinary account settings. Enable public delivery for PDF and ZIP files in Cloudinary Security settings, then re-upload if needed.",
  unavailable:
    "This PDF URL is not reachable right now. Please verify the stored file URL and the hosting provider response.",
};

const MockPapers = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePdf, setActivePdf] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState(false);
  const [pdfIssue, setPdfIssue] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchPdfs();
  }, []);

  useEffect(() => {
    if (!pdfs.length) {
      setActivePdf(null);
      setViewerLoading(false);
      setViewerError(false);
      setPdfIssue(null);
      return;
    }

    setActivePdf((currentPdf) => {
      if (!currentPdf) {
        return pdfs[0];
      }

      return pdfs.find((pdf) => pdf._id === currentPdf._id) || pdfs[0];
    });
  }, [pdfs]);

  useEffect(() => {
    if (!activePdf?.pdfUrl) {
      setViewerLoading(false);
      setViewerError(false);
      setPdfIssue(null);
      return;
    }

    setViewerLoading(true);
    setViewerError(false);
    setPdfIssue(null);
  }, [activePdf]);

  useEffect(() => {
    if (!viewerLoading) return undefined;

    const timeoutId = window.setTimeout(() => {
      setViewerLoading(false);
    }, 6000);

    return () => window.clearTimeout(timeoutId);
  }, [viewerLoading]);

  useEffect(() => {
    if (!activePdf?.pdfUrl) return undefined;

    let isCancelled = false;

    const verifyPdfUrl = async () => {
      try {
        const response = await fetch(activePdf.pdfUrl, { method: "HEAD" });
        const cloudinaryError = response.headers.get("x-cld-error")?.toLowerCase() || "";

        if (isCancelled) return;

        if (cloudinaryError.includes("deny or acl failure")) {
          setPdfIssue("cloudinaryAcl");
          setViewerError(true);
          setViewerLoading(false);
          return;
        }

        if (!response.ok) {
          setPdfIssue("unavailable");
          setViewerError(true);
          setViewerLoading(false);
        }
      } catch (error) {
        if (isCancelled) return;
        console.error("Mock paper availability check failed:", error);
      }
    };

    verifyPdfUrl();

    return () => {
      isCancelled = true;
    };
  }, [activePdf]);

  const fetchPdfs = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/aptitude/pdfs");
      setPdfs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load mock papers:", error);
      toast.error("Failed to load mock papers.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (pdf) => {
    if (!pdf?.pdfUrl) return;

    if (pdfIssue === "cloudinaryAcl") {
      toast.error(PDF_ISSUE_MESSAGES.cloudinaryAcl);
      return;
    }

    try {
      setDownloadingId(pdf._id);
      const response = await fetch(pdf.pdfUrl);
      if (!response.ok) {
        throw new Error("Could not download the PDF file.");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${pdf.title || "mock-paper"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Mock paper download fallback error:", error);
      if (pdfIssue === "unavailable") {
        toast.error(PDF_ISSUE_MESSAGES.unavailable);
        return;
      }
      window.open(pdf.pdfUrl, "_blank", "noopener,noreferrer");
      toast.error("Direct download failed, so the PDF was opened in a new tab.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/aptitude")}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all border border-white/5"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white leading-tight flex items-center gap-2">
              <FolderIcon className="w-6 h-6 text-red-400" />
              Company Mock Papers
            </h1>
            <p className="text-xs font-semibold text-neutral-500">
              Browse, preview, and download company-wise papers from the aptitude module
            </p>
          </div>
        </div>

        {user?.role === "admin" && (
          <button
            onClick={() => navigate("/aptitude/admin/upload-pdf")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-400"
          >
            <PlusIcon className="w-4 h-4" />
            Upload Mock Paper
          </button>
        )}
      </div>

      <div className="max-w-[1700px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="flex-1 flex flex-col min-w-0 bg-white border border-white/10 rounded-2xl overflow-hidden md:h-[calc(100vh-160px)]">
          {activePdf ? (
            <>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-black/10 bg-neutral-950 px-5 py-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white truncate">{activePdf.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      <BuildingOffice2Icon className="w-3.5 h-3.5" />
                      {activePdf.company}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {activePdf.category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (pdfIssue === "cloudinaryAcl") {
                        toast.error(PDF_ISSUE_MESSAGES.cloudinaryAcl);
                        return;
                      }

                      window.open(activePdf.pdfUrl, "_blank", "noopener,noreferrer");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-neutral-100 transition-colors hover:bg-white/10"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    Open in new tab
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(activePdf)}
                    disabled={downloadingId === activePdf._id}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    {downloadingId === activePdf._id ? "Preparing..." : "Download"}
                  </button>
                </div>
              </div>

              <div className="relative flex-1 bg-neutral-950">
                <iframe
                  key={activePdf._id}
                  src={buildViewerUrl(activePdf.pdfUrl)}
                  className="h-full w-full border-0"
                  title={activePdf.title}
                  onLoad={() => setViewerLoading(false)}
                  onError={() => {
                    setViewerError(true);
                    setViewerLoading(false);
                  }}
                />

                {viewerLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm">
                    <div className="glass-panel rounded-2xl border border-white/10 px-6 py-4 text-center">
                      <p className="text-sm font-semibold text-white">Loading mock paper preview...</p>
                      <p className="mt-2 text-xs text-neutral-400">
                        If the preview takes too long, try opening the PDF in a new tab.
                      </p>
                    </div>
                  </div>
                )}

                {viewerError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-950 px-6">
                    <div className="max-w-md rounded-2xl border border-white/10 bg-black/60 p-6 text-center">
                      <DocumentArrowDownIcon className="mx-auto mb-4 h-12 w-12 text-red-400" />
                      <p className="text-lg font-semibold text-white">
                        {pdfIssue === "cloudinaryAcl" ? "Cloudinary is blocking this PDF" : "Preview unavailable"}
                      </p>
                      <p className="mt-2 text-sm text-neutral-400">
                        {PDF_ISSUE_MESSAGES[pdfIssue] || "This browser could not render the PDF inline. You can still open or download it above."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 border border-white/10 text-neutral-500 p-8 text-center">
              <DocumentArrowDownIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-bold text-white mb-2">No Paper Selected</p>
              <p className="text-sm">Please select a mock paper from the list on the right.</p>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[450px] flex-shrink-0 flex flex-col h-[600px] lg:h-[calc(100vh-160px)] glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/10 bg-black/40 backdrop-blur-md">
            <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">
              Available Mock Papers
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar bg-black/20 p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center p-8">
                <span className="loading loading-spinner text-red-500"></span>
              </div>
            ) : pdfs.length === 0 ? (
              <div className="text-center text-neutral-500 p-8">No company mock papers available yet.</div>
            ) : (
              pdfs.map((pdf) => (
                <button
                  key={pdf._id}
                  onClick={() => setActivePdf(pdf)}
                  className={`w-full group flex items-start gap-4 p-4 rounded-xl transition-all text-left ${
                    activePdf?._id === pdf._id
                      ? "bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                      : "hover:bg-white/5 border border-white/5 bg-black/40"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      activePdf?._id === pdf._id
                        ? "bg-red-500/20 text-red-400"
                        : "bg-white/5 text-neutral-400 group-hover:text-red-400"
                    }`}
                  >
                    <DocumentTextIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-bold truncate ${
                        activePdf?._id === pdf._id ? "text-red-400" : "text-neutral-200 group-hover:text-white"
                      }`}
                    >
                      {pdf.title}
                    </h4>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      <span className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-1">
                        <BuildingOffice2Icon className="w-3.5 h-3.5" />
                        {pdf.company}
                      </span>
                      <span className="inline-flex rounded bg-white/5 px-2 py-1">{pdf.category}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockPapers;
