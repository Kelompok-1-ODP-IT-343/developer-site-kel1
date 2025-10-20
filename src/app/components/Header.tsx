'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="text-2xl font-bold text-bni-blue">
                BNI
              </div>
              <span className="ml-2 text-sm text-bni-gray">KPR</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-bni-blue transition-colors">
              Beranda
            </Link>
            <Link href="/cari-rumah" className="text-gray-700 hover:text-bni-blue transition-colors">
              Cari Rumah
            </Link>
            <Link href="#products" className="text-gray-700 hover:text-bni-blue transition-colors">
              Produk KPR
            </Link>
            <Link href="#calculator" className="text-gray-700 hover:text-bni-blue transition-colors">
              Kalkulator
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-bni-blue transition-colors">
              Tentang Kami
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="btn-outline">
              Masuk
            </Link>
            <Link href="/register" className="btn-primary">
              Daftar
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-bni-blue focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-bni-blue">
                Beranda
              </Link>
              <Link href="/cari-rumah" className="block px-3 py-2 text-gray-700 hover:text-bni-blue">
                Cari Rumah
              </Link>
              <Link href="#products" className="block px-3 py-2 text-gray-700 hover:text-bni-blue">
                Produk KPR
              </Link>
              <Link href="#calculator" className="block px-3 py-2 text-gray-700 hover:text-bni-blue">
                Kalkulator
              </Link>
              <Link href="#about" className="block px-3 py-2 text-gray-700 hover:text-bni-blue">
                Tentang Kami
              </Link>
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Link href="/login" className="btn-outline text-center">
                  Masuk
                </Link>
                <Link href="/register" className="btn-primary text-center">
                  Daftar
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}