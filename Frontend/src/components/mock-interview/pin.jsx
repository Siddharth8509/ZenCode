import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/utils";
import {
  EyeIcon,
  DocumentTextIcon,
  SparklesIcon,
  BriefcaseIcon,
  CodeBracketIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { TooltipButton } from "./tooltip-button";

export const InterviewPin = ({ interview, onMockPage = false }) => {
  const navigate = useNavigate();

  const techTags = interview?.techStack
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean) || [];

  return (
    <div
      className={cn(
        "glass-panel rounded-xl p-5 space-y-4 cursor-pointer",
        "border border-white/10 hover:border-orange-500/40 transition-all duration-300",
        "hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] group animate-pop-in"
      )}
    >
      {/* Title row */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 shrink-0 mt-0.5">
          <BriefcaseIcon className="w-5 h-5 text-orange-400" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors truncate">
            {interview?.position}
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
            {interview?.description}
          </p>
        </div>
      </div>

      {/* Tech stack tags */}
      {techTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <CodeBracketIcon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          {techTags.slice(0, 5).map((word, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-[11px] font-medium rounded-full border border-white/10 text-neutral-400 bg-white/5 hover:border-orange-500/50 hover:text-orange-400 transition-colors"
            >
              {word}
            </span>
          ))}
          {techTags.length > 5 && (
            <span className="text-[11px] text-neutral-500">+{techTags.length - 5}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={cn("flex items-center pt-2 border-t border-white/5", onMockPage ? "justify-end" : "justify-between")}>
        {!onMockPage && (
          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
            <CalendarDaysIcon className="w-3.5 h-3.5" />
            <span>
              {interview?.createdAt
                ? new Date(interview.createdAt.toDate()).toLocaleDateString("en-US", { dateStyle: "medium" })
                : "—"}
            </span>
          </div>
        )}

        {!onMockPage && (
          <div className="flex items-center gap-0.5">
            <TooltipButton
              content="View"
              buttonVariant="ghost"
              onClick={() => navigate(`/mock-interview/interview/${interview?.id}`, { replace: true })}
              disbaled={false}
              buttonClassName="hover:text-sky-400 hover:bg-sky-950/30 text-neutral-400"
              icon={<EyeIcon className="w-4 h-4" />}
              loading={false}
            />
            <TooltipButton
              content="Feedback"
              buttonVariant="ghost"
              onClick={() => navigate(`/mock-interview/feedback/${interview?.id}`, { replace: true })}
              disbaled={false}
              buttonClassName="hover:text-amber-400 hover:bg-amber-950/30 text-neutral-400"
              icon={<DocumentTextIcon className="w-4 h-4" />}
              loading={false}
            />
            <TooltipButton
              content="Start Interview"
              buttonVariant="ghost"
              onClick={() => navigate(`/mock-interview/interview/${interview?.id}`, { replace: true })}
              disbaled={false}
              buttonClassName="hover:text-orange-400 hover:bg-orange-500/10 text-neutral-400"
              icon={<SparklesIcon className="w-4 h-4" />}
              loading={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
