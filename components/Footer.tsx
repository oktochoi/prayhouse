'use client';

import React from 'react';
import Link from 'next/link';

const footerLinks = {
  기도: [
    { name: '기도 제목', href: '/prayers' },
    { name: '기도 요청하기', href: '/prayers/new' },
  ],
  선교: [
    { name: '선교 일기', href: '/missions' },
  ],
  나눔: [
    { name: '감사일기', href: '/gratitude' },
  ],
  소개: [
    { name: '기도의 집 소개', href: '/about' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative bg-stone-900 text-stone-300 overflow-hidden">
      {/* 상단 구분선 */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-10 sm:gap-12 lg:gap-16">
          {/* 브랜드 영역 */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 lg:pr-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 flex items-center justify-center">
                <img 
                  src="https://static.readdy.ai/image/aa1565715a7c63aa7d986d857e515b00/0028fe73c321e07de5a22418a2640a3c.png"
                  alt="기도의 집"
                  className="w-full h-full object-contain opacity-90"
                />
              </div>
              <span className="font-['Pacifico'] text-lg text-stone-100">
                기도의 집
              </span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
              함께 기도하는<br />
              가족 공동체
            </p>
          </div>

          {/* 링크 컬럼들 */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-stone-500 mb-4">
                {group}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-400 hover:text-amber-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 하단 영역 */}
        <div className="mt-16 sm:mt-20 pt-10 sm:pt-12 border-t border-stone-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <p className="text-xs text-stone-500">
              © {new Date().getFullYear()} 기도의 집. 주님 안에서 하나 되어.
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-stone-600 hover:text-stone-400 transition-colors">
                  Made with Okto
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
