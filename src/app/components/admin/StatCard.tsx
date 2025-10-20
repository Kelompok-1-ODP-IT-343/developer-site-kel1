"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: number;
  total?: number;
  color?: "blue" | "yellow" | "green" | "red";
}

export function StatCard({ title, value, total = 0, color = "blue" }: StatCardProps) {
  const COLORS: Record<string, { bg: string; shadow: string; text: string }> = {
    blue: {
      bg: "bg-[#3FD8D4]",
      shadow: "shadow-[0_6px_0_#b9e6e3]",
      text: "text-white",
    },
    yellow: {
      bg: "bg-[#FF8500]",
      shadow: "shadow-[0_6px_0_#fbd9a4]",
      text: "text-white",
    },
    green: {
      bg: "bg-[#DDEE59]",
      shadow: "shadow-[0_6px_0_#c3d845]",
      text: "text-gray-900",
    },
    red: {
      bg: "bg-[#757575]",
      shadow: "shadow-[0_6px_0_#4a4a4a]",
      text: "text-white",
    },
  };

  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  const style = COLORS[color] ?? COLORS.blue;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 250, damping: 18 }}
      className={`rounded-2xl ${style.bg} ${style.text} px-6 py-8 ${style.shadow} cursor-pointer transition-transform`}
    >
      <div className="text-2xl font-semibold mb-2">{title}</div>
      <div className="text-6xl font-extrabold leading-none mb-3">{value}</div>

      {/* progress bar */}
      <div className="h-2 bg-white/25 rounded-full overflow-hidden">
        <div
          className="h-2 bg-white rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <p className="mt-2 text-sm opacity-90">{percent}% dari total</p>
    </motion.div>
  );
}
