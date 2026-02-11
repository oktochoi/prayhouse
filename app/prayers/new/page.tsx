
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/components/AuthProvider';
import { requireLogin } from '@/lib/auth';
import { createClient } from '@/utils/supabase/client';

export default function NewPrayerPage() {
  const { userData, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '건강',
    priority: '일반',
    isAnonymous: false,
    tags: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!userData) {
      setShowLoginModal(true);
      return;
    }
    setShowLoginModal(false);
  }, [authLoading, userData]);

  const categories = [
    { value: '건강', label: '건강', icon: 'ri-heart-pulse-line', color: 'bg-red-100 text-red-700' },
    { value: '가족', label: '가족', icon: 'ri-home-heart-line', color: 'bg-blue-100 text-blue-700' },
    { value: '사역', label: '사역', icon: 'ri-hands-pray-line', color: 'bg-purple-100 text-purple-700' },
    { value: '진로', label: '진로', icon: 'ri-roadmap-line', color: 'bg-orange-100 text-orange-700' },
    { value: '관계', label: '관계', icon: 'ri-team-line', color: 'bg-pink-100 text-pink-700' },
    { value: '재정', label: '재정', icon: 'ri-coins-line', color: 'bg-green-100 text-green-700' },
    { value: '학업', label: '학업', icon: 'ri-book-line', color: 'bg-indigo-100 text-indigo-700' },
    { value: '기타', label: '기타', icon: 'ri-more-line', color: 'bg-gray-100 text-gray-700' }
  ];

  const priorities = [
    { value: '일반', label: '일반', color: 'bg-gray-100 text-gray-700', description: '일반적인 기도 제목' },
    { value: '긴급', label: '긴급', color: 'bg-red-100 text-red-700', description: '빠른 기도가 필요한 상황' },
    { value: '감사', label: '감사', color: 'bg-yellow-100 text-yellow-700', description: '하나님께 감사드리는 제목' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginCheck = requireLogin(userData);
    if (loginCheck.needLogin) {
      setShowLoginModal(true);
      return;
    }
    if (!userData) return;

    setIsSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.from('prayers').insert({
      user_id: userData.id,
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      priority: formData.priority,
      status: 'active',
      is_anonymous: formData.isAnonymous,
      author_name: formData.isAnonymous ? null : userData.name,
    });

    setIsSubmitting(false);

    if (error) {
      alert('등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
      return;
    }

    setSubmitSuccess(true);
    setTimeout(() => {
      window.location.href = '/prayers';
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.value === formData.category);
  };

  const getSelectedPriority = () => {
    return priorities.find(pri => pri.value === formData.priority);
  };

  if (submitSuccess) {
    return (
      <main className="min-h-screen bg-amber-50">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center bg-white p-12 rounded-xl shadow-lg max-w-md">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-check-line text-white text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">기도 제목이 등록되었습니다</h2>
            <p className="text-amber-600 mb-6">형제자매들과 함께 기도할 수 있습니다.</p>
            <div className="animate-spin w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-amber-500 mt-3">잠시 후 기도 제목 목록으로 이동합니다...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-amber-50">
        <Header />

        {/* Breadcrumb */}
        <section className="py-4 bg-white border-b border-amber-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-sm text-amber-600">
              <Link href="/" className="hover:text-amber-700">홈</Link>
              <i className="ri-arrow-right-s-line"></i>
              <Link href="/prayers" className="hover:text-amber-700">기도 제목</Link>
              <i className="ri-arrow-right-s-line"></i>
              <span className="text-amber-800 font-medium">새 기도 제목 등록</span>
            </nav>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-hands-pray-line text-white text-2xl"></i>
                </div>
                <h1 className="text-3xl font-bold text-amber-800 mb-2">새 기도 제목 등록</h1>
                <p className="text-amber-600">형제자매들과 함께 나누고 싶은 기도 제목을 등록해주세요</p>
              </div>

              <form id="prayer-form" onSubmit={handleSubmit} className="space-y-6">
                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">
                    기도 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="기도 제목을 입력해주세요"
                  />
                </div>

                {/* 카테고리와 우선순위 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 카테고리 */}
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-3">
                      카테고리 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-10 appearance-none"
                      >
                        {categories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {getSelectedCategory() && (
                          <i className={`${getSelectedCategory()?.icon} text-amber-600`}></i>
                        )}
                      </div>
                    </div>
                    {getSelectedCategory() && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSelectedCategory()?.color}`}>
                          <i className={`${getSelectedCategory()?.icon} mr-1`}></i>
                          {getSelectedCategory()?.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 우선순위 */}
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-3">
                      우선순위 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-8 appearance-none"
                      >
                        {priorities.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <i className="ri-arrow-down-s-line text-amber-600"></i>
                      </div>
                    </div>
                    {getSelectedPriority() && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSelectedPriority()?.color}`}>
                          {getSelectedPriority()?.label}
                        </span>
                        <p className="text-xs text-amber-600 mt-1">{getSelectedPriority()?.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 내용 */}
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">
                    기도 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={8}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                    placeholder="기도하고 싶은 내용을 자세히 작성해주세요..."
                  />
                  <div className="text-right text-xs text-amber-500 mt-1">
                    {formData.content.length}/500
                  </div>
                </div>

                {/* 익명 옵션 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="anonymous"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleChange}
                    className="w-4 h-4 text-amber-600 bg-gray-100 border-amber-300 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="anonymous" className="ml-2 text-sm text-amber-700">
                    익명으로 등록하기
                  </label>
                </div>

                {/* 안내 메시지 */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <i className="ri-information-line text-amber-600 text-lg mr-3 mt-0.5"></i>
                    <div className="text-sm text-amber-700">
                      <p className="font-medium mb-1">기도 제목 등록 안내</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>등록된 기도 제목은 모든 회원이 볼 수 있습니다</li>
                        <li>개인정보나 민감한 내용은 포함하지 말아주세요</li>
                        <li>서로를 격려하고 위로하는 내용으로 작성해주세요</li>
                        <li>긴급한 기도가 필요한 경우 우선순위를 “긴급”으로 설정해주세요</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex space-x-4 pt-6">
                  <Link href="/prayers" className="flex-1">
                    <button
                      type="button"
                      className="w-full py-3 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium"
                    >
                      취소
                    </button>
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-lg hover:from-amber-700 hover:to-amber-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        등록 중...
                      </>
                    ) : (
                      '기도 제목 등록하기'
                    )}
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
        onClose={() => window.location.href = '/prayers'}
      />
    </>
  );
}
