"use client";

import React from "react";
import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "lucide-react";
import ZenCodeMark from "@/components/ZenCodeMark";

interface FooterLink {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
  label: string;
  links: FooterLink[];
}

const footerLinks: FooterSection[] = [
  {
    label: "Product",
    links: [
      { title: "Problems", href: "/problemset" },
      { title: "Aptitude", href: "/aptitude" },
      { title: "Learning", href: "/learning" },
      { title: "Mock Interview", href: "/mock-interview" },
    ],
  },
  {
    label: "AI Tools",
    links: [
      { title: "Resume Analyzer", href: "/ai-analyzer" },
      { title: "Resume Builder", href: "/resume-builder" },
      { title: "Modules", href: "#modules" },
      { title: "Journey", href: "#roadmap" },
    ],
  },
  {
    label: "Company",
    links: [
      { title: "Homepage", href: "/" },
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms of Service", href: "/terms" },
      { title: "Support", href: "/help" },
    ],
  },
  {
    label: "Social Links",
    links: [
      { title: "Facebook", href: "#", icon: FacebookIcon },
      { title: "Instagram", href: "#", icon: InstagramIcon },
      { title: "Youtube", href: "#", icon: YoutubeIcon },
      { title: "LinkedIn", href: "#", icon: LinkedinIcon },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mx-auto mt-24 flex w-full max-w-6xl flex-col items-center justify-center rounded-t-[2.5rem] border border-white/10 border-b-0 bg-[radial-gradient(40%_180px_at_50%_0%,rgba(249,115,22,0.18),transparent)] px-6 py-12 lg:py-16">
      <div className="absolute left-1/2 top-0 h-px w-1/3 -translate-x-1/2 rounded-full bg-orange-300/50 blur-sm" />

      <div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
        <AnimatedContainer className="space-y-5">
          <div className="flex items-center gap-3">
            <ZenCodeMark className="size-10" />
            <div>
              <div className="text-lg font-semibold tracking-tight text-white">ZenCode</div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                Interview Prep OS
              </div>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-7 text-neutral-400">
            One focused workspace for DSA, aptitude, learning, resume improvement, and AI-led mock interviews.
          </p>
          <p className="text-sm text-neutral-500">
            (c) {new Date().getFullYear()} ZenCode. All rights reserved.
          </p>
        </AnimatedContainer>

        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
          {footerLinks.map((section, index) => (
            <AnimatedContainer key={section.label} delay={0.1 + index * 0.08}>
              <div className="mb-10 md:mb-0">
                <h3 className="text-xs uppercase tracking-[0.24em] text-neutral-300">
                  {section.label}
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-neutral-400">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <a
                        href={link.href}
                        className="inline-flex items-center transition-colors duration-300 hover:text-orange-200"
                      >
                        {link.icon && <link.icon className="me-1 size-4" />}
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>["className"];
  children: ReactNode;
};

function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
