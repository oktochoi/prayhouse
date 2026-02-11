'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [todayCount, setTodayCount] = useState<number | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    async function fetchTodayCount() {
      try {
        const supabase = createClient();
        const today = new Date().toISOString().slice(0, 10);
        const { data } = await supabase
          .from('prayer_participations')
          .select('user_id')
          .gte('created_at', `${today}T00:00:00`)
          .lt('created_at', `${today}T23:59:59`);
        const uniqueUsers = new Set(data?.map((r) => r.user_id) ?? []).size;
        setTodayCount(uniqueUsers);
      } catch {
        setTodayCount(0);
      }
    }
    fetchTodayCount();
  }, []);

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background: Church interior, soft morning light - no heavy blur */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://readdy.ai/api/search-image?query=A%20warm%20and%20peaceful%20church%20sanctuary%20interior%20bathed%20in%20soft%20golden%20light%20streaming%20through%20stained%20glass%20windows%2C%20with%20wooden%20pews%20and%20a%20simple%20cross%2C%20creating%20a%20serene%20and%20sacred%20atmosphere%20perfect%20for%20prayer%20and%20reflection%2C%20photorealistic%20style%20with%20gentle%20warm%20tones&width=1920&height=1080&seq=hero-bg-001&orientation=landscape')",
          opacity: isLoaded ? 0.7 : 0
        }}
      />
      {/* Slight dark gradient overlay (20-30%) for contrast - clear depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.35) 100%)',
        }}
      />

      <div className="relative w-full max-w-2xl mx-auto px-6 sm:px-8 py-20 sm:py-28 lg:py-36 text-center">
        {/* Small Tag */}
        <p
          className={`text-[11px] sm:text-xs tracking-[0.2em] text-stone-500 uppercase mb-8 sm:mb-10 font-medium ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        >
          기도의 집
        </p>

        {/* Main Headline - Grounded and strong */}
        <h1
          className={`font-serif-kr text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-tight mb-4 sm:mb-5 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-600 delay-100`}
        >
          혼자가 아닙니다
        </h1>
        <h2
          className={`font-serif-kr text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-medium text-white/95 leading-tight mb-8 sm:mb-10 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-600 delay-200`}
        >
          함께 기도하는 하나님의 가족
        </h2>

        {/* Subtext - Clear contrast */}
        <p
          className={`text-base sm:text-lg text-stone-200/90 leading-relaxed max-w-md mx-auto mb-12 sm:mb-14 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-600 delay-300`}
        >
          서로의 기도 제목을 나누고 함께 하나님을 바라봅니다
        </p>

        {/* Buttons - Generous spacing */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-10 sm:mb-12 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-600 delay-400`}
        >
          <Link
            href="/prayers"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-4.5 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/25 transition-all duration-300 cursor-pointer whitespace-nowrap text-base"
          >
            지금 기도에 참여하기
            <i className="ri-arrow-right-line text-lg" />
          </Link>
          <Link
            href="/prayers"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 border border-white/40 text-white/95 font-medium rounded-full hover:bg-white/10 hover:border-white/60 transition-all duration-300 cursor-pointer whitespace-nowrap text-sm sm:text-base"
          >
            오늘의 기도 제목 보기
          </Link>
        </div>

        {/* Below buttons - Small subtle text */}
        {/* <p
          className={`text-xs sm:text-sm text-stone-400/90 ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-600 delay-500`}
        >
          {todayCount !== null
            ? `오늘 ${todayCount}명이 이곳에서 기도했습니다`
            : '오늘 이곳에서 기도가 이어지고 있습니다'}
        </p> */}
      </div>
    </section>
  );
}
