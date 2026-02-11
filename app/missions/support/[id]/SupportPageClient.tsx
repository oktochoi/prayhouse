
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/components/AuthProvider';
import { requireLogin } from '@/lib/auth';

interface SupportPageClientProps {
  params: { id: string };
}

export default function SupportPageClient({ params }: SupportPageClientProps) {
  const { userData } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [supportType, setSupportType] = useState('monthly');
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    paymentMethod: 'card'
  });

  // 실제 선교 일기서 데이터를 localStorage에서 가져오거나 기본값 사용
  const [missionReport, setMissionReport] = useState({
    id: params.id,
    title: '케냐 나이로비 의료선교',
    missionary: '김의료 선교사',
    region: '아프리카',
    country: '케냐',
    type: '의료선교',
    description: '나이로비 슬럼가에서 무료 진료와 복음 전파를 통해 하나님의 사랑을 나누는 의료선교입니다.',
    image: 'https://readdy.ai/api/search-image?query=kenyan%20medical%20mission%20clinic%20with%20doctors%20treating%20patients%20in%20beautiful%20clean%20facility%2C%20african%20patients%20receiving%20care%2C%20warm%20golden%20lighting%2C%20hopeful%20healing%20atmosphere%2C%20medical%20equipment%20and%20supplies%2C%20cross-cultural%20ministry%20setting&width=600&height=400&seq=1&orientation=landscape',
    needsSupport: true,
    supportGoal: 1150000,
    supportNeeds: [
      { item: '의료용품', amount: 500000, description: '기본 의료 장비와 약품' },
      { item: '교육비', amount: 300000, description: '현지 의료진 교육 프로그램' },
      { item: '생필품', amount: 200000, description: '선교사 가족 생활비' },
      { item: '교통비', amount: 150000, description: '현지 이동 및 방문 비용' }
    ],
    supportDescription: '케냐 슬럼가 의료선교를 위해 의료 장비와 약품, 교육비 등이 절실히 필요합니다. 여러분의 후원이 생명을 살리는 귀한 사역이 됩니다.',
    currentSupport: 680000,
    supporters: 24
  });

  useEffect(() => {
    // localStorage에서 선교 일기서 데이터 로드
    const savedReport = localStorage.getItem('currentMissionReport');
    if (savedReport) {
      const parsedReport = JSON.parse(savedReport);
      if (parsedReport.needsSupport) {
        setMissionReport(prev => ({
          ...prev,
          ...parsedReport,
          supportGoal: parsedReport.supportGoal || parsedReport.supportNeeds?.reduce((sum: number, need: any) => sum + need.amount, 0) || prev.supportGoal
        }));
      }
    }
  }, []);

  const predefinedAmounts = ['30000', '50000', '100000', '200000', '500000'];

  const getCurrentAmount = () => {
    return selectedAmount || customAmount;
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const loginCheck = requireLogin(userData);
    if (loginCheck.needLogin) {
      setShowLoginModal(true);
      return;
    }

    const amount = getCurrentAmount();
    if (!amount || parseInt(amount) < 1000) {
      alert('후원 금액은 최소 1,000원 이상이어야 합니다.');
      return;
    }

    // 후원 성공 처리
    const supportAmount = parseInt(amount);
    setMissionReport(prev => ({
      ...prev,
      currentSupport: prev.currentSupport + supportAmount,
      supporters: prev.supporters + 1
    }));

    // 실제 결제 처리 로직
    alert(`${supportType === 'monthly' ? '정기' : '일시'} 후원 신청이 완료되었습니다!\n후원 금액: ${supportAmount.toLocaleString()}원\n\n선교사님께 큰 도움이 될 것입니다. 감사합니다!`);
    
    // 폼 초기화
    setSupportForm({
      name: '',
      email: '',
      phone: '',
      message: '',
      paymentMethod: 'card'
    });
    setSelectedAmount('');
    setCustomAmount('');
  };


  const progressPercentage = missionReport.supportGoal > 0 
    ? (missionReport.currentSupport / missionReport.supportGoal) * 100 
    : 0;

  // 후원이 필요하지 않은 경우 처리
  if (!missionReport.needsSupport) {
    return (
      <>
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <Header />
          
          <section className="py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-8">
                <i className="ri-information-line text-gray-500 text-4xl"></i>
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">후원이 설정되지 않은 선교입니다</h1>
              <p className="text-gray-600 text-lg mb-8">
                이 선교 일기서는 후원을 받지 않습니다.
                <br />
                선교 일기와 보고서를 통해 선교사님의 소식을 확인해보세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/missions/reports/${params.id}`}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center whitespace-nowrap"
                >
                  <i className="ri-book-open-line mr-2"></i>
                  선교 일기서 보기
                </Link>
                <Link
                  href={`/missions/reports/${params.id}/daily`}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center whitespace-nowrap"
                >
                  <i className="ri-calendar-line mr-2"></i>
                  선교 일기 보기
                </Link>
              </div>
            </div>
          </section>
          
          <Footer />
        </main>
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Header />

        {/* Hero Section */}
        <section
          className="relative py-24 bg-cover bg-center bg-no-repeat overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.7)), url('${missionReport.image}')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                <i className="ri-gift-line mr-2"></i>
                선교 후원
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {missionReport.title}
                <span className="block text-yellow-300 text-2xl md:text-3xl mt-2 font-normal">후원하기</span>
              </h1>

              <div className="flex flex-wrap justify-center gap-4 text-white/90 mb-6">
                <span className="flex items-center">
                  <i className="ri-user-heart-line mr-1"></i>
                  {missionReport.missionary}
                </span>
                <span className="flex items-center">
                  <i className="ri-map-pin-line mr-1"></i>
                  {missionReport.region} • {missionReport.country}
                </span>
                <span className="flex items-center">
                  <i className="ri-heart-pulse-line mr-1"></i>
                  {missionReport.type}
                </span>
              </div>

              <p className="text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
                하나님의 사랑을 전하는 선교 사역에 함께 참여해주세요.
                <br />
                여러분의 후원이 생명을 살리고 영혼을 구원하는 귀한 사역이 됩니다.
              </p>
            </div>
          </div>
        </section>

        {/* Support Progress */}
        <section className="py-16 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-emerald-100">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-4">
                  후원 현황
                </h2>
                <p className="text-emerald-600 text-lg">{missionReport.supportDescription}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-emerald-700">
                    {missionReport.currentSupport.toLocaleString()}원
                  </span>
                  <span className="text-lg text-gray-600">
                    목표: {missionReport.supportGoal.toLocaleString()}원
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-6 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  >
                    <span className="text-white text-xs font-bold">
                      {progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                  <span>후원자 {missionReport.supporters}명 참여</span>
                  <span>
                    부족한 금액: {Math.max(0, missionReport.supportGoal - missionReport.currentSupport).toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* Support Needs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {missionReport.supportNeeds.map((need, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-blue-800">{need.item}</h4>
                      <span className="text-blue-600 font-bold">{need.amount.toLocaleString()}원</span>
                    </div>
                    <p className="text-blue-700 text-sm">{need.description}</p>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {missionReport.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Support Form */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-purple-100">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <i className="ri-heart-line text-white text-3xl"></i>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-4">
                  후원 신청하기
                </h2>
                <p className="text-gray-600 text-lg">
                  선교 사역에 함께하는 마음으로 후원해주세요
                </p>
              </div>

              <form onSubmit={handleSupportSubmit} className="space-y-8">
                {/* Support Type */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                  <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                    <i className="ri-calendar-check-line mr-2"></i>
                    후원 방식
                  </h3>

                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="supportType"
                        value="monthly"
                        checked={supportType === 'monthly'}
                        onChange={(e) => setSupportType(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                          supportType === 'monthly'
                            ? 'border-purple-500 bg-purple-100 text-purple-800'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                        }`}
                      >
                        <i className="ri-refresh-line text-2xl mb-2"></i>
                        <p className="font-bold">정기 후원</p>
                        <p className="text-sm">매월 지속적인 후원</p>
                      </div>
                    </label>

                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="supportType"
                        value="onetime"
                        checked={supportType === 'onetime'}
                        onChange={(e) => setSupportType(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                          supportType === 'onetime'
                            ? 'border-purple-500 bg-purple-100 text-purple-800'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                        }`}
                      >
                        <i className="ri-gift-2-line text-2xl mb-2"></i>
                        <p className="font-bold">일시 후원</p>
                        <p className="text-sm">한 번의 후원</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Support Amount */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                    <i className="ri-money-dollar-circle-line mr-2"></i>
                    후원 금액
                  </h3>

                  {/* Predefined Amounts */}
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                    {predefinedAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 text-center whitespace-nowrap ${
                          selectedAmount === amount
                            ? 'border-blue-500 bg-blue-100 text-blue-800'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-bold text-sm">
                          {parseInt(amount).toLocaleString()}원
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-2">
                      직접 입력
                    </label>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount('');
                      }}
                      placeholder="원하는 금액을 입력하세요"
                      min="1000"
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                    <p className="text-xs text-blue-500 mt-2">최소 후원 금액: 1,000원</p>
                  </div>

                  {getCurrentAmount() && (
                    <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800 font-medium">
                          {supportType === 'monthly' ? '매월 후원 금액' : '일시 후원 금액'}:
                        </span>
                        <span className="text-blue-900 font-bold text-lg">
                          {parseInt(getCurrentAmount()).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Personal Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                  <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                    <i className="ri-user-line mr-2"></i>
                    후원자 정보
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-green-700 mb-2">
                          이름 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={supportForm.name}
                          onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                          required
                          className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                          placeholder="후원자 이름"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-green-700 mb-2">
                          이메일 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={supportForm.email}
                          onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                          required
                          className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                          placeholder="이메일 주소"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-green-700 mb-2">
                        연락처
                      </label>
                      <input
                        type="tel"
                        value={supportForm.phone}
                        onChange={(e) => setSupportForm({ ...supportForm, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                        placeholder="연락처 (선택사항)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-green-700 mb-2">
                        후원 메시지
                      </label>
                      <textarea
                        value={supportForm.message}
                        onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                        rows={4}
                        maxLength={200}
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all duration-300"
                        placeholder="선교사님께 전하고 싶은 메시지를 적어주세요 (선택사항)"
                      />
                      <div className="text-right text-xs text-green-500 mt-2">
                        {supportForm.message.length}/200
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
                  <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
                    <i className="ri-bank-card-line mr-2"></i>
                    결제 방법
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={supportForm.paymentMethod === 'card'}
                        onChange={(e) => setSupportForm({ ...supportForm, paymentMethod: e.target.value })}
                        className="sr-only"
                      />
                      <div
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                          supportForm.paymentMethod === 'card'
                            ? 'border-orange-500 bg-orange-100 text-orange-800'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
                        }`}
                      >
                        <i className="ri-bank-card-line text-xl mb-2"></i>
                        <p className="font-bold text-sm">신용카드</p>
                      </div>
                    </label>

                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank"
                        checked={supportForm.paymentMethod === 'bank'}
                        onChange={(e) => setSupportForm({ ...supportForm, paymentMethod: e.target.value })}
                        className="sr-only"
                      />
                      <div
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                          supportForm.paymentMethod === 'bank'
                            ? 'border-orange-500 bg-orange-100 text-orange-800'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
                        }`}
                      >
                        <i className="ri-bank-line text-xl mb-2"></i>
                        <p className="font-bold text-sm">계좌이체</p>
                      </div>
                    </label>

                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="phone"
                        checked={supportForm.paymentMethod === 'phone'}
                        onChange={(e) => setSupportForm({ ...supportForm, paymentMethod: e.target.value })}
                        className="sr-only"
                      />
                      <div
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                          supportForm.paymentMethod === 'phone'
                            ? 'border-orange-500 bg-orange-100 text-orange-800'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
                        }`}
                      >
                        <i className="ri-smartphone-line text-xl mb-2"></i>
                        <p className="font-bold text-sm">휴대폰 결제</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Agreement */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="agreement"
                      required
                      className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 mr-3"
                    />
                    <label htmlFor="agreement" className="text-gray-700">
                      <span className="font-bold">후원 약관</span> 및 <span className="font-bold">개인정보 처리방침</span>에 동의합니다.{' '}
                      <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-8">
                    후원금은 선교 활동에만 사용되며, 투명한 회계 처리를 약속드립니다.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-6 pt-8">
                  <Link
                    href={`/missions/reports/${params.id}`}
                    className="flex-1 py-4 border-2 border-purple-300 text-purple-700 rounded-xl hover:bg-purple-50 transition-all duration-300 font-bold text-center whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line mr-2"></i>
                    보고서로 돌아가기
                  </Link>
                  <button
                    type="submit"
                    disabled={!getCurrentAmount() || !supportForm.name.trim() || !supportForm.email.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                  >
                    <i className="ri-heart-line mr-2"></i>
                    {supportType === 'monthly' ? '정기 후원 시작하기' : '후원하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}