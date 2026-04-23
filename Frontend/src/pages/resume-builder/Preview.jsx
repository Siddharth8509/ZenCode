import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ResumePreview from "../../components/resume-builder/ResumePreview";
import { ArrowLeft, LoaderCircleIcon } from "lucide-react";
import api from "./api";

const Preview = () => {
  const { resumeId } = useParams();

  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const { data } = await api.get("/api/resumes/public/" + resumeId);
        setResumeData(data.resume);
      } catch (error) {
        console.log(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, [resumeId]);

  return resumeData ? (
    <div className="bg-neutral-950 min-h-[80vh]">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <ResumePreview
          data={resumeData}
          template={resumeData.template}
          accentColor={resumeData.accent_color}
          classes="py-4 bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
        />
      </div>
    </div>
  ) : (
    <div className="min-h-[80vh] bg-black">
      {isLoading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <LoaderCircleIcon className="size-10 text-orange-500 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <p className="text-center text-5xl text-neutral-500 font-semibold">
            Resume not found
          </p>
          <p className="text-neutral-600 mt-2 text-sm">
            This resume may be private or may have been deleted.
          </p>
          <Link
            to="/"
            className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all duration-300"
          >
            <ArrowLeft className="size-4" /> Go to Home Page
          </Link>
        </div>
      )}
    </div>
  );
};

export default Preview;
