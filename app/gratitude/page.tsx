'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GratitudeMainPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Header />

      <main className="pt-12 sm:pt-16 lg:pt-24 pb-32">
        <div className="max-w-xl mx-auto px-5 sm:px-6">
          <p className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-stone-500 mb-4 sm:mb-6">
            Gratitude Journal
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-stone-800 mb-6 sm:mb-8 leading-tight">
            감사일기
          </h1>

          <p className="text-lg sm:text-xl font-light text-stone-600 mb-12 sm:mb-16 leading-relaxed">
            오늘 하루, 하나님께 감사했던 한 가지는 무엇인가요?
          </p>

          <div className="space-y-4 sm:space-y-6">
            <Link
              href="/gratitude/mine"
              className="flex items-center justify-between w-full px-6 py-5 sm:py-6 bg-white/90 rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg hover:border-amber-100 hover:bg-amber-50/30 transition-all duration-300 group"
            >
              <span className="text-base sm:text-lg font-light text-stone-800 group-hover:text-amber-800">
                내 감사일기 쓰기
              </span>
              <i className="ri-quill-pen-line text-2xl text-amber-500/70 group-hover:text-amber-600" />
            </Link>

            <Link
              href="/gratitude/others"
              className="flex items-center justify-between w-full px-6 py-5 sm:py-6 bg-white/90 rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg hover:border-amber-100 hover:bg-amber-50/30 transition-all duration-300 group"
            >
              <span className="text-base sm:text-lg font-light text-stone-800 group-hover:text-amber-800">
                다른 사람의 감사 보기
              </span>
              <i className="ri-heart-line text-2xl text-amber-500/70 group-hover:text-amber-600" />
            </Link>
          </div>

          <p className="mt-12 sm:mt-16 text-sm font-light text-stone-500 leading-relaxed">
            감사일기는 마음을 비우고 은혜를 돌아보는 시간입니다.
            <br />
            조용히 기록하고, 필요할 때 나눕니다.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
