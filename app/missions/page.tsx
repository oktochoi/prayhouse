'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/components/AuthProvider';
import { requireLogin } from '@/lib/auth';
import { getMissions, type Mission } from '@/lib/missions';

export default function MissionsPage() {
  const { userData } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMissions().then((list) => {
      setMissions(list);
      setLoading(false);
    });
  }, []);

  const handleNewMission = () => {
    const loginCheck = requireLogin(userData ?? null);
    if (loginCheck.needLogin) {
      setShowLoginModal(true);
      return;
    }
    window.location.href = '/missions/new';
  };

  const handleSupportClick = (mission: Mission) => {
    setSelectedMission(mission);
    setShowAccountModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('계좌번호가 복사되었습니다.');
  };

  const totalSupporters = missions.reduce((sum, m) => sum + (m.supporters || 0), 0);

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-stone-50/60">
        <Header />

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-transparent to-orange-50/20" />
          <div className="relative max-w-6xl mx-auto px-6 sm:px-8 pt-16 sm:pt-24 pb-12 sm:pb-16">
            <AnimatedSection>
              <div className="text-center max-w-2xl mx-auto">
                <p className="text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase text-amber-600 mb-4">
                  Mission Reports
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-stone-800 mb-4 sm:mb-5 leading-tight">
                  선교 일기
                </h1>
                <p className="text-base sm:text-lg font-light text-stone-600 leading-relaxed">
                  전 세계로 나아가는 형제자매들의 선교 이야기를
                  <br className="hidden sm:block" />
                  함께 나누고 기도로 동행합니다
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <div className="mt-10 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/80 rounded-full border border-amber-100/80 shadow-sm">
                  <i className="ri-earth-line text-amber-600 text-lg" />
                  <span className="text-sm font-medium text-stone-700">
                    {loading ? '...' : `${missions.length}개 선교 현장`}
                  </span>
                </div>
                {totalSupporters > 0 && (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-white/80 rounded-full border border-amber-100/80 shadow-sm">
                    <i className="ri-group-line text-amber-600 text-lg" />
                    <span className="text-sm font-medium text-stone-700">
                      {totalSupporters}명이 함께 후원
                    </span>
                  </div>
                )}
              </div>
            </AnimatedSection>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent mx-auto max-w-2xl" />
        </section>

        {/* 선교 여정 그리드 */}
        <section className="py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            {loading ? (
              <div className="py-20 text-center text-stone-500 text-sm">불러오는 중...</div>
            ) : missions.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-stone-500 mb-6">아직 등록된 선교 일기가 없습니다.</p>
                <button
                  onClick={handleNewMission}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium tracking-wide rounded-full hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-amber-500/30 cursor-pointer"
                >
                  <i className="ri-quill-pen-line"></i>
                  첫 번째 선교 여정 기록하기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {missions.map((mission, index) => (
                  <AnimatedSection key={mission.id} delay={index * 80}>
                    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border border-stone-100/80">
                      <Link href={`/missions/reports/${mission.id}`}>
                        <div className="relative aspect-[16/10] overflow-hidden cursor-pointer bg-stone-100">
                          {mission.images?.[0]?.url ? (
                            <img
                              src={mission.images[0].url}
                              alt={mission.title}
                              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className="ri-image-line text-4xl text-stone-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                          <div className="absolute top-4 left-4 flex items-center gap-2">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-stone-700">
                              {mission.country}
                            </span>
                            {mission.priority === '긴급' && (
                              <span className="px-3 py-1 bg-red-500 rounded-full text-xs font-medium text-white animate-pulse">
                                긴급
                              </span>
                            )}
                            {mission.priority === '특별' && (
                              <span className="px-3 py-1 bg-amber-500 rounded-full text-xs font-medium text-white">
                                특별
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-4 right-4">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                              <i className="ri-calendar-line text-amber-600 text-sm"></i>
                              <span className="text-xs font-medium text-stone-700">
                                Day {mission.days || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>

                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-amber-600 font-medium">{mission.type}</span>
                          <span className="text-stone-300">·</span>
                          <span className="text-xs text-stone-400">
                            {mission.is_anonymous ? '익명' : mission.missionary_name}
                          </span>
                        </div>

                        <Link href={`/missions/reports/${mission.id}`}>
                          <h2 className="text-lg font-semibold text-stone-800 mb-2 leading-snug group-hover:text-amber-700 transition-colors cursor-pointer line-clamp-1">
                            {mission.title}
                          </h2>
                        </Link>

                        <p className="text-sm text-stone-500 mb-5 leading-relaxed line-clamp-2">
                          {mission.description.replace(/<[^>]*>/g, '').slice(0, 120)}
                          {mission.description.replace(/<[^>]*>/g, '').length > 120 ? '...' : ''}
                        </p>

                        {mission.needs_support && mission.support_goal > 0 && (
                          <div className="pt-5 border-t border-stone-100">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-stone-400">후원 현황</span>
                              <span className="text-xs font-semibold text-amber-600">
                                {((mission.current_support / mission.support_goal) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mb-4">
                              <div
                                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-700"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (mission.current_support / mission.support_goal) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-stone-400">
                                {mission.supporters}명 참여
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSupportClick(mission);
                                }}
                                className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors cursor-pointer"
                              >
                                <i className="ri-heart-line"></i>
                                후원하기
                              </button>
                            </div>
                          </div>
                        )}

                        {(!mission.needs_support || mission.support_goal === 0) && (
                          <Link
                            href={`/missions/reports/${mission.id}`}
                            className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors cursor-pointer mt-2"
                          >
                            이야기 읽기
                            <i className="ri-arrow-right-line"></i>
                          </Link>
                        )}
                      </div>
                    </article>
                  </AnimatedSection>
                ))}
              </div>
            )}

            {!loading && missions.length > 0 && (
              <AnimatedSection delay={500}>
                <div className="mt-20 text-center">
                  <button
                    onClick={handleNewMission}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium tracking-wide rounded-full hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-quill-pen-line"></i>
                    새 선교 여정 기록하기
                  </button>
                </div>
              </AnimatedSection>
            )}
          </div>
        </section>

        <Footer />
      </main>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {}}
      />

      {showAccountModal && selectedMission && selectedMission.account_number && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/30">
                <i className="ri-hand-heart-line text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-2">후원 계좌 안내</h3>
              <p className="text-stone-500 text-sm">{selectedMission.title}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 mb-6">
              <div className="space-y-5">
                <div>
                  <p className="text-xs text-stone-400 mb-1.5 font-medium">은행</p>
                  <p className="text-lg font-semibold text-stone-800">
                    {selectedMission.account_bank || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 mb-1.5 font-medium">계좌번호</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-stone-800 tracking-wide">
                      {selectedMission.account_number}
                    </p>
                    <button
                      onClick={() => copyToClipboard(selectedMission.account_number!)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-all cursor-pointer shadow-sm"
                    >
                      <i className="ri-file-copy-line text-lg"></i>
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-stone-400 mb-1.5 font-medium">예금주</p>
                  <p className="text-lg font-semibold text-stone-800">
                    {selectedMission.account_holder || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-700 text-center flex items-center justify-center gap-2">
                <i className="ri-heart-fill text-amber-500"></i>
                후원해주신 금액은 선교 활동에 소중히 사용됩니다
              </p>
            </div>

            <button
              onClick={() => setShowAccountModal(false)}
              className="w-full bg-stone-800 text-white py-4 rounded-xl hover:bg-stone-700 transition-colors font-medium cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
