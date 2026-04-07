import React from 'react';

const TopicCard = ({ title, description, icon, accentColor, glowColor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/[0.02] backdrop-blur-3xl p-8
        rounded-[2rem]
        border border-white/5
        hover:bg-white/[0.04] hover:border-white/20
        hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        transition-all duration-500 ease-out
        cursor-pointer group
        h-full flex flex-col items-start
        relative overflow-hidden
      `}
    >
      {/* Decorative gradient overlay on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-${glowColor.replace('bg-', '')}/5 via-transparent to-transparent z-0 pointer-events-none`} />

      {/* Dynamic Background Glow based on card theme */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 ${glowColor} rounded-full blur-[80px] opacity-10 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none z-0`} />

      {/* Icon */}
      <div
        className={`
          relative z-10
          w-16 h-16 rounded-[1.25rem]
          bg-neutral-900 border border-white/10
          flex items-center justify-center
          text-3xl mb-8
          shadow-[0_8px_30px_rgba(0,0,0,0.5)]
          transition-all duration-500 ease-out
          group-hover:scale-110 group-hover:rotate-3 group-hover:border-white/30
          ${accentColor}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-[1.25rem] pointer-events-none" />
        {icon}
      </div>

      {/* Title */}
      <h3
        className="
          relative z-10
          text-2xl font-bold tracking-tight
          text-white
          mb-3
          transition-colors duration-300
        "
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="
          relative z-10
          text-neutral-400
          text-[15px]
          leading-relaxed
          mb-8
          flex-grow
          group-hover:text-neutral-300
          transition-colors duration-300
        "
      >
        {description}
      </p>

      {/* CTA */}
      <div
        className="
          relative z-10
          mt-auto
          flex items-center justify-between
          w-full
          pt-6
          border-t border-white/5 group-hover:border-white/10
          transition-colors duration-300
        "
      >
        <span className={`text-xs font-black uppercase tracking-widest ${accentColor}`}>
          Enter Module
        </span>
        <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300 ${accentColor}`}>
          <span className="transform transition-transform duration-500 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopicCard;
