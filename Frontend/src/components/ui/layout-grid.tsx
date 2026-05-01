"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type LayoutGridCard = {
  id: number;
  content: React.ReactNode;
  className?: string;
  thumbnail: string;
  title: string;
  eyebrow?: string;
  description?: string;
  href?: string;
};

export const LayoutGrid = ({ cards }: { cards: LayoutGridCard[] }) => {
  const [selected, setSelected] = useState<LayoutGridCard | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (selected) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

  const handleOpen = (card: LayoutGridCard) => {
    setSelected(card);
  };

  const handleClose = () => {
    setSelected(null);
  };

  return (
    <>
      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 md:auto-rows-[220px] md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(card.className, "min-h-[240px]")}
          >
            <motion.div
              layoutId={`card-${card.id}`}
              onClick={() => handleOpen(card)}
              className="group relative h-full w-full cursor-pointer overflow-hidden rounded-[1.75rem] border border-orange-400/10 bg-[#0A0A0A] transition-colors duration-500 hover:border-orange-400/20 hover:bg-[#111111]"
            >
              <motion.div
                layoutId={`image-${card.id}`}
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <motion.div layoutId={`preview-${card.id}`}>
                  {card.eyebrow && (
                    <p className="text-[11px] uppercase tracking-[0.26em] text-orange-200/85">
                      {card.eyebrow}
                    </p>
                  )}
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="mt-2 max-w-md text-sm leading-6 text-neutral-200/85">
                      {card.description}
                    </p>
                  )}
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-100">
                    Open details
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.button
              type="button"
              aria-label="Close module details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
              <motion.div
                layoutId={`card-${selected.id}`}
                className="relative h-[min(42rem,80vh)] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-orange-400/20 bg-[#0A0A0A] shadow-[0_40px_120px_-48px_rgba(249,115,22,0.5)]"
              >
                <motion.div
                  layoutId={`image-${selected.id}`}
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/68 to-black/20" />

                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white transition-colors hover:bg-black/65"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-6 pt-20 md:px-10 md:pb-10">
                  <motion.div
                    layoutId={`preview-${selected.id}`}
                    className="max-w-3xl"
                  >
                    {selected.eyebrow && (
                      <p className="text-[11px] uppercase tracking-[0.28em] text-orange-200/85">
                        {selected.eyebrow}
                      </p>
                    )}
                    <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                      {selected.title}
                    </h3>
                    {selected.description && (
                      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-200/90">
                        {selected.description}
                      </p>
                    )}
                  </motion.div>

                  <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/35 p-5 backdrop-blur-md md:p-6">
                    {selected.content}
                  </div>

                  {selected.href && (
                    <a
                      href={selected.href}
                      className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
                    >
                      Open module
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
