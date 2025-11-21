"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DESKTOP_MIN_WIDTH = 1024; // admin requires wider layout

export default function UnsupportedDevice() {
  const router = useRouter();
  const [width, setWidth] = useState<number>(DESKTOP_MIN_WIDTH);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setWidth(w);
      if (w >= DESKTOP_MIN_WIDTH) {
        // Auto recover when user moves to a desktop-sized viewport
        router.replace("/login");
      }
    };
    window.addEventListener("resize", onResize);
    // First check on mount
    if (typeof window !== "undefined") {
      setMounted(true);
      setWidth(window.innerWidth);
      if (window.innerWidth >= DESKTOP_MIN_WIDTH) {
        router.replace("/login");
      }
    }
    return () => window.removeEventListener("resize", onResize);
  }, [router]);

  const checkNow = () => {
    const w = window.innerWidth;
    if (w >= DESKTOP_MIN_WIDTH) {
      router.replace("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3FD8D4] via-white to-[#DDEE59] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-[#FF8500] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#FF8500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6m6 6V6" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Akses Khusus Perangkat Desktop</h1>
        <p className="text-[#757575] mb-4">
          Demi kenyamanan kerja admin, akurasi input, dan keamanan data nasabah,
          aplikasi ini dibatasi untuk digunakan pada perangkat desktop.
        </p>
        <div className="text-sm text-gray-500 mb-6">
          <p className="mb-1">Kebijakan: Device-Based Access Restriction</p>
          <p>Alasan: Mengurangi risiko salah input dan menjaga privasi data sensitif.</p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={checkNow}
            className="px-4 py-2 rounded-md bg-[#3FD8D4] text-white font-semibold hover:bg-[#2BB8B4]"
          >
            Cek Ulang Sekarang
          </button>
          <span className="text-xs text-gray-500" suppressHydrationWarning>
            Lebar saat ini: {mounted ? width : DESKTOP_MIN_WIDTH}px
          </span>
        </div>
      </div>
    </div>
  );
}
