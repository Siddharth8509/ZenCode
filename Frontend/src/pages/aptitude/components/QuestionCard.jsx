import React from "react";
import { Link } from "react-router-dom";

const QuestionCard = ({ question, index }) => {
  const toText = (value, fallback = "") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string") return value.trim() || fallback;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return fallback;
  };

  const questionText = toText(question?.questionText, "Untitled question");
  const category = toText(question?.category, "Aptitude");
  const topic = toText(question?.topic, "Aptitude");
  const difficulty = toText(question?.difficulty, "Medium");
  const company = toText(question?.company);

  const difficultyColors = {
    Easy: "badge-success badge-outline",
    Medium: "badge-warning badge-outline",
    Hard: "badge-error badge-outline",
  };

  const getColorForString = (str) => {
    const value = toText(str, "default");
    const colors = [
      "badge-primary badge-outline",
      "badge-secondary badge-outline",
      "badge-accent badge-outline",
      "badge-info badge-outline",
      "border-orange-500 text-orange-400 bg-orange-500/10",
      "border-red-500 text-red-400 bg-red-500/10",
      "border-amber-500 text-amber-400 bg-amber-500/10",
    ];

    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const content = (
    <>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 font-bold text-sm group-hover:bg-orange-500/20 group-hover:text-orange-400 group-hover:border-orange-500/30 transition">
          {index + 1}
        </div>

        <div>
          <h4 className="text-slate-200 font-semibold text-base leading-snug">
            {questionText.length > 95
              ? `${questionText.substring(0, 95)}...`
              : questionText}
          </h4>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className={`badge text-[10px] font-bold uppercase tracking-wide px-2 py-2.5 rounded-lg ${getColorForString(category)}`}
            >
              {category}
            </span>

            <span
              className={`badge text-[11px] font-semibold px-2 py-2.5 rounded-lg ${getColorForString(topic)}`}
            >
              {topic}
            </span>

            <span
              className={`badge text-[10px] font-bold px-2 py-2.5 rounded-lg uppercase ${difficultyColors[difficulty] || difficultyColors.Medium}`}
            >
              {difficulty}
            </span>

            {company && (
              <span
                className={`badge text-[10px] font-bold uppercase px-2 py-2.5 rounded-lg ${getColorForString(company)}`}
              >
                {company}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center">
        <span className="text-xs font-bold text-orange-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          Solve -&gt;
        </span>
      </div>
    </>
  );

  const cardClassName = "group glass-panel p-4 rounded-[20px] border border-white/5 hover:border-orange-500/40 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] transition-all flex items-center justify-between";

  if (!question?._id) {
    return <div className={cardClassName}>{content}</div>;
  }

  return (
    <Link
      to={`/aptitude/question/${question._id}`}
      className={cardClassName}
    >
      {content}
    </Link>
  );
};

export default QuestionCard;
