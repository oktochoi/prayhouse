'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';

/* -------------------------------------------------
   Static data – placed outside the component so that
   the module is a valid client component.
   ------------------------------------------------- */
const values = [
  {
    title: '기도',
    description: '하나님과의 깊은 교제를 통해 영적 성장을 추구합니다',
    icon: 'ri-hand-heart-line',
  },
  {
    title: '나눔',
    description: '서로의 짐을 나누고 함께 기쁨을 나누는 공동체입니다',
    icon: 'ri-hearts-line',
  },
  {
    title: '선교',
    description: '복음을 전하고 이웃을 섬기는 사명을 실천합니다',
    icon: 'ri-global-line',
  },
  {
    title: '성장',
    description: '말씀과 기도로 함께 성장하는 신앙 공동체를 만듭니다',
    icon: 'ri-seedling-line',
  },
] as const;

/* -------------------------------------------------
   About page component
   ------------------------------------------------- */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-100/40 to-stone-50">
      <Header />

      <main>
        {/* Hero Intro */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/25 via-amber-50/10 to-transparent" />
          <div className="relative max-w-4xl mx-auto px-6 sm:px-8">
              <AnimatedSection>
                <p className="text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase text-amber-600 mb-4">
                  About Us
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-stone-800 mb-6 leading-tight">
                  소개
                </h1>
                <p className="text-lg sm:text-xl font-light text-stone-600 leading-relaxed max-w-xl">
                  함께 기도하고 성장하며,<br />보냄 받은 자리에서 복음을 살아내는 공동체입니다
                </p>
              </AnimatedSection>

              <AnimatedSection delay={150}>
                <div className="mt-12 p-6 sm:p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-amber-100/60 shadow-sm">
                  <p className="text-stone-500 text-sm sm:text-base italic leading-relaxed text-center font-light">
                    “아버지께서 나를 보내신 것 같이 나도 너희를 보내노라”
                    <br />
                    <span className="text-amber-600 font-medium not-italic mt-2 inline-block">
                      — 요한복음 20:21
                    </span>
                  </p>
                </div>
              </AnimatedSection>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent my-4 sm:my-8" />

          {/* Vision */}
          <section className="py-14 sm:py-20">
            <AnimatedSection>
              <h2 className="text-2xl sm:text-3xl font-light text-stone-800 mb-8 sm:mb-10">
                우리의 비전
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-10 border border-amber-100/60 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="space-y-6 sm:space-y-8 text-base sm:text-lg font-light text-stone-600 leading-relaxed">
                  <p>
                    우리는 하나님의 사랑 안에서 서로를 격려하고 지지하는 신앙 공동체입니다.
                  </p>
                  <p>
                    기도를 통해 하나님과 깊이 교제하고, 말씀으로 서로를 세우며,<br/>
                    보냄 받은 자리에서 복음을 살아내는 것이 우리의 사명입니다.
                  </p>
                  <p>
                    모든 사람이 하나님의 사랑을 경험하고,<br/>
                    그 사랑 안에서 자유롭게 성장할 수 있는 공간을 만들어가고 있습니다.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent my-8 sm:my-12" />

          {/* Values */}
          <section className="py-14 sm:py-20">
            <AnimatedSection>
              <p className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-amber-600 mb-3">
                Our Values
              </p>
              <h2 className="text-2xl sm:text-3xl font-light text-stone-800 mb-10 sm:mb-12">
                핵심 가치
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {values.map((value, idx) => (
                <AnimatedSection key={idx} delay={80 + idx * 80}>
                  <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-amber-100/60 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/40 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                      <i className={`${value.icon} text-amber-600 text-xl sm:text-2xl`} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-medium text-stone-800 mb-2 sm:mb-3">
                      {value.title}
                    </h3>
                    <p className="text-sm sm:text-base font-light text-stone-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent my-8 sm:my-12" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
