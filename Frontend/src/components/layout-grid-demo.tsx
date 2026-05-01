"use client";

import React from "react";
import { LayoutGrid, type LayoutGridCard } from "@/components/ui/layout-grid";
import { cn } from "@/lib/utils";

export default function LayoutGridDemo({
  cards,
  className,
}: {
  cards: LayoutGridCard[];
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <LayoutGrid cards={cards} />
    </div>
  );
}
