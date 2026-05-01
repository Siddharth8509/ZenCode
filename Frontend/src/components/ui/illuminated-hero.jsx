import { cn } from "../../utils/utils";

export function IlluminatedHero({
  eyebrow,
  title,
  subtitle,
  highlightedText,
  description,
  align = "center",
  className,
  descriptionClassName,
}) {
  const isLeftAligned = align === "left";

  return (
    <div
      className={cn(
        "relative flex w-full flex-col justify-center overflow-visible py-10 text-white [--factor:min(1000px,100vh)] [--size:min(var(--factor),100vw)]",
        isLeftAligned ? "items-start text-left" : "items-center text-center",
        className
      )}
    >
      <div className="absolute h-full w-full max-w-[44em] pointer-events-none">
        <div className="shadow-bgt absolute size-full translate-[0_-70%] scale-[1.2] animate-[onloadbgt_1s_ease-in-out_forwards] rounded-[100em] bg-gradient-to-b from-orange-500/35 to-transparent opacity-50" />
        <div className="shadow-bgb absolute size-full translate-[0_-10%] scale-[1.18] animate-[onloadbgb_1s_ease-in-out_forwards] rounded-[100em] bg-gradient-to-t from-red-500/25 to-transparent opacity-40" />
      </div>

      {eyebrow && (
        <div className="brand-chip relative z-10 mb-5">
          <span className="h-2 w-2 rounded-full bg-orange-300 shadow-[0_0_18px_rgba(253,186,116,0.9)]" />
          {eyebrow}
        </div>
      )}

      <div
        className={cn(
          "relative z-10 text-5xl font-semibold leading-[1.02] tracking-[-0.04em] md:text-7xl",
          isLeftAligned ? "max-w-4xl" : "max-w-5xl"
        )}
      >
        {title}
        <br />
        <span
          className={cn(
            "relative inline-block pb-2 pt-2",
            "before:absolute before:animate-[onloadopacity_1s_ease-out_forwards] before:opacity-0 before:content-[attr(data-text)]",
            "before:bg-gradient-to-r before:from-orange-200 before:via-amber-100 before:to-orange-300 before:bg-clip-text before:text-transparent",
            "filter-[url(#glow-4)] bg-gradient-to-r from-orange-300 via-amber-100 to-orange-400 bg-clip-text text-transparent"
          )}
          data-text={highlightedText}
        >
          {highlightedText}
        </span>
        {subtitle && (
          <>
            <br />
            <span className="text-white/92">{subtitle}</span>
          </>
        )}
      </div>

      {description && (
        <p
          className={cn(
            "relative z-10 mt-7 max-w-2xl text-base leading-7 text-neutral-300 md:text-lg",
            isLeftAligned && "mr-auto",
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}

      <svg
        className="absolute -z-10 h-0 w-0"
        width="1440px"
        height="300px"
        viewBox="0 0 1440 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id="glow-4"
            colorInterpolationFilters="sRGB"
            x="-50%"
            y="-200%"
            width="200%"
            height="500%"
          >
            <feGaussianBlur in="SourceGraphic" data-target-blur="4" stdDeviation="4" result="blur4" />
            <feGaussianBlur in="SourceGraphic" data-target-blur="19" stdDeviation="19" result="blur19" />
            <feGaussianBlur in="SourceGraphic" data-target-blur="9" stdDeviation="9" result="blur9" />
            <feGaussianBlur in="SourceGraphic" data-target-blur="30" stdDeviation="30" result="blur30" />
            <feColorMatrix in="blur4" result="color-0-blur" type="matrix" values="1 0 0 0 0 0 0.9803921568627451 0 0 0 0 0 0.9647058823529412 0 0 0 0 0 0.8 0" />
            <feOffset in="color-0-blur" result="layer-0-offsetted" dx="0" dy="0" data-target-offset-y="0" />
            <feColorMatrix in="blur19" result="color-1-blur" type="matrix" values="0.8156862745098039 0 0 0 0 0 0.49411764705882355 0 0 0 0 0 0.2627450980392157 0 0 0 0 0 1 0" />
            <feOffset in="color-1-blur" result="layer-1-offsetted" dx="0" dy="2" data-target-offset-y="2" />
            <feColorMatrix in="blur9" result="color-2-blur" type="matrix" values="1 0 0 0 0 0 0.6666666666666666 0 0 0 0 0 0.36470588235294116 0 0 0 0 0 0.65 0" />
            <feOffset in="color-2-blur" result="layer-2-offsetted" dx="0" dy="2" data-target-offset-y="2" />
            <feColorMatrix in="blur30" result="color-3-blur" type="matrix" values="1 0 0 0 0 0 0.611764705882353 0 0 0 0 0 0.39215686274509803 0 0 0 0 0 1 0" />
            <feOffset in="color-3-blur" result="layer-3-offsetted" dx="0" dy="2" data-target-offset-y="2" />
            <feColorMatrix in="blur30" result="color-4-blur" type="matrix" values="0.4549019607843137 0 0 0 0 0 0.16470588235294117 0 0 0 0 0 0 0 0 0 0 0 1 0" />
            <feOffset in="color-4-blur" result="layer-4-offsetted" dx="0" dy="16" data-target-offset-y="16" />
            <feColorMatrix in="blur30" result="color-5-blur" type="matrix" values="0.4235294117647059 0 0 0 0 0 0.19607843137254902 0 0 0 0 0 0.11372549019607843 0 0 0 0 0 1 0" />
            <feOffset in="color-5-blur" result="layer-5-offsetted" dx="0" dy="64" data-target-offset-y="64" />
            <feColorMatrix in="blur30" result="color-6-blur" type="matrix" values="0.21176470588235294 0 0 0 0 0 0.10980392156862745 0 0 0 0 0 0.07450980392156863 0 0 0 0 0 1 0" />
            <feOffset in="color-6-blur" result="layer-6-offsetted" dx="0" dy="64" data-target-offset-y="64" />
            <feColorMatrix in="blur30" result="color-7-blur" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.68 0" />
            <feOffset in="color-7-blur" result="layer-7-offsetted" dx="0" dy="64" data-target-offset-y="64" />
            <feMerge>
              <feMergeNode in="layer-0-offsetted" />
              <feMergeNode in="layer-1-offsetted" />
              <feMergeNode in="layer-2-offsetted" />
              <feMergeNode in="layer-3-offsetted" />
              <feMergeNode in="layer-4-offsetted" />
              <feMergeNode in="layer-5-offsetted" />
              <feMergeNode in="layer-6-offsetted" />
              <feMergeNode in="layer-7-offsetted" />
              <feMergeNode in="layer-0-offsetted" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
