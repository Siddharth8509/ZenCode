import { cn } from "@/utils/utils";

export const Headings = ({ title, description, isSubHeading = false }) => {
  return (
    <div>
      <h2
        className={cn(
          "font-bold font-sans tracking-tight text-white",
          isSubHeading
            ? "text-lg md:text-xl text-neutral-300"
            : "text-3xl md:text-4xl text-glow"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className="text-sm text-neutral-400 mt-2 max-w-xl">{description}</p>
      )}
    </div>
  );
};
