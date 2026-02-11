
'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import GratitudeCard from '@/components/GratitudeCard';
import PrayerSection from '@/components/PrayerSection';
import AnsweredPrayersSection from '@/components/AnsweredPrayersSection';
import AnimatedSection from '@/components/AnimatedSection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <Header />
      <HeroSection />

      {/* 감사일기 카드 */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-b from-white via-amber-50/20 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/40 via-transparent to-transparent" />
        <div className="relative max-w-2xl mx-auto px-5 sm:px-6">
          <AnimatedSection delay={50}>
            <GratitudeCard />
          </AnimatedSection>
        </div>
      </section>

      <PrayerSection />

      <AnsweredPrayersSection />

      {/* CTA - 기도 제목 등록 */}
      <AnimatedSection>
        <section className="relative py-20 sm:py-28 lg:py-32 bg-stone-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-800 to-stone-900" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-3xl" />
          <div className="relative max-w-lg mx-auto px-5 sm:px-6 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-8 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <i className="ri-quill-pen-line text-2xl sm:text-3xl text-amber-200/90"></i>
            </div>
            
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-light mb-4 sm:mb-6 text-stone-100">
              기도 제목을 나눠주세요
            </h2>
            <p className="text-sm sm:text-base text-stone-400 mb-10 sm:mb-12 leading-relaxed max-w-sm mx-auto">
              여러분의 기도 제목을 나누고<br />
              함께 기도하는 은혜를 경험해보세요
            </p>
            <Link
              href="/prayers/new"
              className="inline-flex items-center gap-2 px-8 sm:px-10 py-4 sm:py-4.5 bg-white text-stone-800 text-sm sm:text-base font-medium rounded-full hover:bg-amber-50 transition-all duration-300 cursor-pointer whitespace-nowrap"
            >
              기도 제목 등록하기
              <i className="ri-arrow-right-line text-lg"></i>
            </Link>
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </main>
  );
}
