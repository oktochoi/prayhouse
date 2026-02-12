
'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[160px] rounded-xl border border-stone-200 bg-stone-50 animate-pulse" />
  ),
});
import { useAuth } from '@/components/AuthProvider';
import { requireLogin } from '@/lib/auth';
import { createClient } from '@/utils/supabase/client';
import { processImagesToWebP } from '@/lib/image-utils';
import { MISSION_IMAGES_BUCKET, MAX_IMAGES_PER_POST } from '@/lib/missions';

function NewMissionReportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { userData, loading: authLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingImagePaths, setExistingImagePaths] = useState<string[]>([]);
  const [clearExistingImages, setClearExistingImages] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    subtitle: '',
    type: '단기선교',
    region: '아시아',
    country: '',
    theme: '전도',
    priority: '일반',
    startDate: '',
    endDate: '',
    description: '<p></p>',
    missionaryName: '',
    isAnonymous: false,
    imageFiles: [] as File[],
    imagePreviews: [] as string[],
    needsSupport: false,
    supportGoal: '',
    supportCurrent: '',
    supportDescription: '',
    accountBank: '',
    accountNumber: '',
    accountHolder: '',
    isCompleted: false,
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!userData) {
      setShowLoginModal(true);
      return;
    }
    setShowLoginModal(false);
  }, [authLoading, userData]);

  useEffect(() => {
    if (!editId) return;
    if (authLoading) return;
    if (!userData) {
      setShowLoginModal(true);
      return;
    }
    const supabase = createClient();
    setIsEditMode(true);
    setClearExistingImages(false);
    (async () => {
      const { data: mission } = await supabase
        .from('missions')
        .select('*')
        .eq('id', editId)
        .single();
      if (!mission) return;
      if (mission.user_id !== userData.id) {
        alert('작성자만 수정할 수 있습니다.');
        router.push('/missions');
        return;
      }
      const { data: images } = await supabase
        .from('mission_images')
        .select('storage_path')
        .eq('mission_id', editId)
        .order('sort_order');
      const imagePaths = (images || []).map((row) => row.storage_path);
      const imageUrls = imagePaths.map(
        (path) => supabase.storage.from(MISSION_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl
      );

      setExistingImagePaths(imagePaths);
      setReportForm((prev) => ({
        ...prev,
        title: mission.title,
        subtitle: mission.subtitle || '',
        type: mission.type,
        region: mission.region,
        country: mission.country,
        theme: mission.theme,
        priority: mission.priority,
        startDate: mission.start_date,
        endDate: mission.end_date,
        description: mission.description,
        missionaryName: mission.missionary_name,
        isAnonymous: mission.is_anonymous,
        needsSupport: mission.needs_support,
        supportGoal: mission.needs_support ? String(mission.support_goal || '') : '',
        supportCurrent: mission.needs_support ? String(mission.current_support || 0) : '',
        supportDescription: mission.support_description || '',
        accountBank: mission.account_bank || '',
        accountNumber: mission.account_number || '',
        accountHolder: mission.account_holder || '',
        isCompleted: mission.is_completed ?? false,
        imageFiles: [],
        imagePreviews: imageUrls,
      }));
    })();
  }, [authLoading, editId, userData, router]);

  const regions = [
    { value: '아시아', label: '아시아', icon: 'ri-map-2-line' },
    { value: '아프리카', label: '아프리카', icon: 'ri-map-2-line' },
    { value: '유럽', label: '유럽', icon: 'ri-map-2-line' },
    { value: '남미', label: '남미', icon: 'ri-map-2-line' },
    { value: '북미', label: '북미', icon: 'ri-map-2-line' },
    { value: '오세아니아', label: '오세아니아', icon: 'ri-map-2-line' },
  ];

  const missionTypes = [
    { value: '단기선교', label: '단기선교', description: '1개월 미만의 선교 활동' },
    { value: '장기선교', label: '장기선교', description: '1년 이상의 선교 활동' },
    { value: '의료선교', label: '의료선교', description: '의료 서비스를 통한 선교' },
    { value: '교육선교', label: '교육선교', description: '교육을 통한 선교 활동' },
    { value: '구제선교', label: '구제선교', description: '구호와 구제를 통한 선교' },
    { value: '전도선교', label: '전도선교', description: '복음 전파 중심의 선교' },
    { value: '문화선교', label: '문화선교', description: '문화 교류를 통한 선교' },
    { value: '기타', label: '기타', description: '기타 형태의 선교 활동' },
  ];

  const themes = [
    { value: '전도', label: '전도', icon: 'ri-message-3-line', color: 'bg-blue-100 text-blue-700' },
    { value: '의료', label: '의료', icon: 'ri-heart-pulse-line', color: 'bg-red-100 text-red-700' },
    { value: '교육', label: '교육', icon: 'ri-book-open-line', color: 'bg-green-100 text-green-700' },
    { value: '구제', label: '구제', icon: 'ri-hand-heart-line', color: 'bg-orange-100 text-orange-700' },
    { value: '건축', label: '건축', icon: 'ri-building-line', color: 'bg-purple-100 text-purple-700' },
    { value: '문화교류', label: '문화교류', icon: 'ri-global-line', color: 'bg-pink-100 text-pink-700' },
    { value: '어린이사역', label: '어린이사역', icon: 'ri-child-line', color: 'bg-yellow-100 text-yellow-700' },
    { value: '청소년사역', label: '청소년사역', icon: 'ri-team-line', color: 'bg-indigo-100 text-indigo-700' },
  ];

  const priorities = [
    { value: '일반', label: '일반', color: 'bg-gray-100 text-gray-700', description: '일반적인 선교 일기서' },
    { value: '긴급', label: '긴급', color: 'bg-red-100 text-red-700', description: '긴급한 기도와 후원이 필요한 상황' },
    { value: '특별', label: '특별', color: 'bg-purple-100 text-purple-700', description: '특별한 의미나 성과가 있는 선교' },
  ];

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginCheck = requireLogin(userData ?? null);
    if (loginCheck.needLogin) {
      setShowLoginModal(true);
      return;
    }
    if (!userData) return;
    if (!reportForm.title.trim() || !reportForm.description || reportForm.description === '<p></p>') {
      alert('제목과 선교 개요를 입력해주세요.');
      return;
    }
    if (!reportForm.country.trim() || !reportForm.startDate || !reportForm.endDate) {
      alert('국가와 기간을 입력해주세요.');
      return;
    }
    if (!reportForm.missionaryName.trim()) {
      alert('선교사 이름을 입력해주세요.');
      return;
    }
    if (reportForm.needsSupport && (!reportForm.supportGoal || parseInt(reportForm.supportGoal) < 10000)) {
      alert('후원 목표 금액을 10,000원 이상으로 설정해주세요.');
      return;
    }
    if (
      reportForm.needsSupport &&
      reportForm.supportCurrent &&
      parseInt(reportForm.supportCurrent) > parseInt(reportForm.supportGoal || '0')
    ) {
      alert('현재 모금액은 목표 금액을 초과할 수 없습니다.');
      return;
    }
    if (reportForm.needsSupport && !reportForm.supportDescription.trim()) {
      alert('후원 사용 목적을 입력해주세요.');
      return;
    }
    if (reportForm.needsSupport && (!reportForm.accountBank || !reportForm.accountNumber || !reportForm.accountHolder)) {
      alert('후원 계좌 정보를 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    try {
      let missionId = editId ?? null;
      if (editId) {
        const { error: missionError } = await supabase
          .from('missions')
          .update({
            title: reportForm.title,
            subtitle: reportForm.subtitle || null,
            type: reportForm.type,
            region: reportForm.region,
            country: reportForm.country,
            theme: reportForm.theme,
            priority: reportForm.priority,
            start_date: reportForm.startDate,
            end_date: reportForm.endDate,
            description: reportForm.description,
            missionary_name: reportForm.missionaryName,
            is_anonymous: reportForm.isAnonymous,
            needs_support: reportForm.needsSupport,
            support_goal: reportForm.needsSupport ? parseInt(reportForm.supportGoal) : 0,
            current_support: reportForm.needsSupport ? parseInt(reportForm.supportCurrent || '0') : 0,
            support_description: reportForm.needsSupport ? reportForm.supportDescription.trim() : null,
            account_bank: reportForm.needsSupport ? reportForm.accountBank : null,
            account_number: reportForm.needsSupport ? reportForm.accountNumber : null,
            account_holder: reportForm.needsSupport ? reportForm.accountHolder : null,
            is_completed: reportForm.isCompleted,
            completed_at: reportForm.isCompleted ? new Date().toISOString() : null,
          })
          .eq('id', editId);
        if (missionError) {
          throw new Error(missionError.message || '수정 실패');
        }
      } else {
        const { data: mission, error: missionError } = await supabase
          .from('missions')
          .insert({
            user_id: userData.id,
            title: reportForm.title,
            subtitle: reportForm.subtitle || null,
            type: reportForm.type,
            region: reportForm.region,
            country: reportForm.country,
            theme: reportForm.theme,
            priority: reportForm.priority,
            start_date: reportForm.startDate,
            end_date: reportForm.endDate,
            description: reportForm.description,
            missionary_name: reportForm.missionaryName,
            is_anonymous: reportForm.isAnonymous,
            needs_support: reportForm.needsSupport,
            support_goal: reportForm.needsSupport ? parseInt(reportForm.supportGoal) : 0,
            current_support: reportForm.needsSupport ? parseInt(reportForm.supportCurrent || '0') : 0,
            support_description: reportForm.needsSupport ? reportForm.supportDescription.trim() : null,
            account_bank: reportForm.needsSupport ? reportForm.accountBank : null,
            account_number: reportForm.needsSupport ? reportForm.accountNumber : null,
            account_holder: reportForm.needsSupport ? reportForm.accountHolder : null,
            is_completed: reportForm.isCompleted,
            completed_at: reportForm.isCompleted ? new Date().toISOString() : null,
          })
          .select('id')
          .single();

        if (missionError || !mission) {
          throw new Error(missionError?.message || '저장 실패');
        }
        missionId = mission.id;
      }

      if (!missionId) throw new Error('저장 실패');

      if ((clearExistingImages || reportForm.imageFiles.length > 0) && existingImagePaths.length > 0) {
        await supabase.storage.from(MISSION_IMAGES_BUCKET).remove(existingImagePaths);
        await supabase.from('mission_images').delete().eq('mission_id', missionId);
      }

      if (reportForm.imageFiles.length > 0) {
        const blobs = await processImagesToWebP(
          reportForm.imageFiles.slice(0, MAX_IMAGES_PER_POST),
          MAX_IMAGES_PER_POST
        );
        for (let i = 0; i < blobs.length; i++) {
          if (blobs[i].size > 5 * 1024 * 1024) {
            throw new Error('이미지 용량이 5MB를 초과합니다. 더 작은 이미지를 사용해주세요.');
          }
          const path = `missions/${missionId}/${crypto.randomUUID()}.webp`;
          const { error: uploadError } = await supabase.storage
            .from(MISSION_IMAGES_BUCKET)
            .upload(path, blobs[i], { contentType: 'image/webp', upsert: false });
          if (uploadError) {
            throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
          }
          await supabase.from('mission_images').insert({
            mission_id: missionId,
            storage_path: path,
            sort_order: i,
          });
        }
      }

      router.push(`/missions/reports/${missionId}/daily`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const remaining = MAX_IMAGES_PER_POST - reportForm.imageFiles.length;
    if (remaining <= 0) {
      alert('썸네일은 1장만 업로드할 수 있습니다.');
      return;
    }
    const toAdd = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, remaining);
    if (editId && existingImagePaths.length > 0) {
      setClearExistingImages(true);
    }
    const previews: string[] = [];
    for (const file of toAdd) {
      previews.push(URL.createObjectURL(file));
    }
    setReportForm((prev) => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...toAdd],
      imagePreviews: [...prev.imagePreviews, ...previews],
    }));
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const prev = reportForm.imagePreviews[index];
    if (prev) URL.revokeObjectURL(prev);
    if (editId && existingImagePaths.length > 0 && reportForm.imageFiles.length === 0) {
      setClearExistingImages(true);
    }
    setReportForm((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
    setCurrentImageIndex((i) => (i >= reportForm.imageFiles.length - 1 ? Math.max(0, reportForm.imageFiles.length - 2) : i));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev >= reportForm.imagePreviews.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev <= 0 ? reportForm.imagePreviews.length - 1 : prev - 1));
  };

  const calculateDuration = () => {
    if (!reportForm.startDate || !reportForm.endDate) return '';
    const start = new Date(reportForm.startDate);
    const end = new Date(reportForm.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) {
      return `${diffDays}일`;
    } else if (diffDays <= 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}개월`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years}년`;
    }
  };

  const getSelectedTheme = () => {
    return themes.find((theme) => theme.value === reportForm.theme);
  };

  const getSelectedPriority = () => {
    return priorities.find((pri) => pri.value === reportForm.priority);
  };

  const getSelectedType = () => {
    return missionTypes.find((type) => type.value === reportForm.type);
  };

  return (
    <>
      <main className="min-h-screen bg-stone-50">
        <Header />

        {/* Hero Section */}
        <section
          className="relative py-24 bg-cover bg-center bg-no-repeat overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.45)), url('https://readdy.ai/api/search-image?query=missionary%20writing%20journal%20diary%20in%20beautiful%20peaceful%20setting%20with%20warm%20golden%20sunlight%20streaming%20through%20window%2C%20notebook%20and%20pen%20on%20wooden%20table%2C%20inspiring%20atmosphere%20for%20reflection%20and%20writing%2C%20decorative%20elements%2C%20hopeful%20and%20serene%20mood&width=1200&height=600&seq=1&orientation=landscape')`,
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-6 py-2 bg-black/30 rounded-full text-stone-100 text-sm font-medium mb-6">
              <i className="ri-edit-line mr-2"></i>
              {isEditMode ? '선교 일기서 수정' : '새 선교 일기서'}
            </div>

            <h1 className="text-4xl md:text-6xl font-semibold text-white mb-6 leading-tight">
              {isEditMode ? '선교 일기서 수정' : '선교 일기서 만들기'}
              <span className="block text-amber-200 text-3xl md:text-4xl mt-2">
                {isEditMode ? 'Edit Mission Report' : 'Create Mission Report'}
              </span>
            </h1>

            <p className="text-lg text-stone-200 max-w-3xl mx-auto leading-relaxed">
              선교지에서의 경험과 은혜를 나누는 보고서를 {isEditMode ? '수정합니다' : '만들어보세요'}.
              <br />
              기본 정보를 입력하고 매일의 이야기를 기록할 수 있습니다.
            </p>
          </div>
        </section>

        {/* Report Creation Form */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-lg shadow-stone-200/60 p-10 border border-stone-200">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-stone-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-stone-300/60">
                  <i className="ri-book-open-line text-white text-3xl"></i>
                </div>
                <h2 className="text-4xl font-semibold text-stone-800 mb-4">
                  선교 일기서 기본 정보
                </h2>
                <p className="text-stone-500 text-lg">
                  선교 일기서의 썸네일을 만들고, 이후 매일의 일기를 작성할 수 있습니다
                </p>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-8">
                {/* 기본 정보 섹션 */}
                <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6 flex items-center">
                    <i className="ri-information-line mr-2"></i>
                    선교 기본 정보
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-amber-700 mb-3">
                        선교 일기서 제목 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={reportForm.title}
                        onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                        placeholder="예) 케냐 나이로비 의료선교 일기"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-amber-700 mb-3">
                          선교 유형 <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={reportForm.type}
                          onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-8 transition-all duration-300 appearance-none"
                        >
                          {missionTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        {getSelectedType() && (
                          <p className="text-xs text-amber-600 mt-1">{getSelectedType()?.description}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-amber-700 mb-3">
                          지역 <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={reportForm.region}
                          onChange={(e) => setReportForm({ ...reportForm, region: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-8 transition-all duration-300 appearance-none"
                        >
                          {regions.map((region) => (
                            <option key={region.value} value={region.value}>
                              {region.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-amber-700 mb-3">
                          선교 테마 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={reportForm.theme}
                            onChange={(e) => setReportForm({ ...reportForm, theme: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-10 transition-all duration-300 appearance-none"
                          >
                            {themes.map((theme) => (
                              <option key={theme.value} value={theme.value}>
                                {theme.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            {getSelectedTheme() && (
                              <i className={`${getSelectedTheme()?.icon} text-amber-600`}></i>
                            )}
                          </div>
                        </div>
                        {getSelectedTheme() && (
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSelectedTheme()?.color}`}
                            >
                              <i className={`${getSelectedTheme()?.icon} mr-1`}></i>
                              {getSelectedTheme()?.label}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-amber-700 mb-3">
                          우선순위 <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={reportForm.priority}
                          onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-8 transition-all duration-300 appearance-none"
                        >
                          {priorities.map((priority) => (
                            <option key={priority.value} value={priority.value}>
                              {priority.label}
                            </option>
                          ))}
                        </select>
                        {getSelectedPriority() && (
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSelectedPriority()?.color}`}
                            >
                              {getSelectedPriority()?.label}
                            </span>
                            <p className="text-xs text-amber-600 mt-1">{getSelectedPriority()?.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-amber-700 mb-3">
                        국가명 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={reportForm.country}
                        onChange={(e) => setReportForm({ ...reportForm, country: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                        placeholder="예) 케냐, 캄보디아, 인도"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-amber-700 mb-3">
                        선교사 이름 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={reportForm.missionaryName}
                        onChange={(e) => setReportForm({ ...reportForm, missionaryName: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                        placeholder="예) 김선교"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-amber-700 mb-3">
                          선교 시작일 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={reportForm.startDate}
                          onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                          required
                          className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-amber-700 mb-3">
                          선교 종료일 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={reportForm.endDate}
                          onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                          required
                          className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {calculateDuration() && (
                      <div className="bg-amber-100 border border-amber-300 rounded-xl p-4">
                        <div className="flex items-center">
                          <i className="ri-calendar-line text-amber-600 mr-2"></i>
                          <span className="text-amber-800 font-medium">
                            예상 선교 기간:{' '}
                            <span className="font-bold">{calculateDuration()}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 후원 설정 섹션 */}
                <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6 flex items-center">
                    <i className="ri-hand-heart-line mr-2"></i>
                    후원 설정 (선택사항)
                  </h3>

                  <div className="mb-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reportForm.needsSupport}
                        onChange={(e) => setReportForm({ ...reportForm, needsSupport: e.target.checked })}
                        className="w-5 h-5 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 mr-3"
                      />
                      <div>
                        <span className="text-stone-800 font-semibold text-lg">이 선교를 위한 후원을 받고 싶어요</span>
                        <p className="text-stone-500 text-sm mt-1">
                          후원 목표와 필요 항목을 설정하면 후원자들이 선교를 지원할 수 있습니다
                        </p>
                      </div>
                    </label>
                  </div>

                  {reportForm.needsSupport && (
                    <div className="space-y-6 bg-white p-6 rounded-xl border border-stone-200">
                      <div>
                        <label className="block text-sm font-semibold text-stone-600 mb-3">
                          후원 목표 금액 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={reportForm.supportGoal}
                          onChange={(e) => setReportForm({ ...reportForm, supportGoal: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                          placeholder="예) 1000000"
                          min="10000"
                        />
                        <p className="text-xs text-stone-500 mt-1">
                          최소 10,000원 이상의 목표 금액을 설정해주세요
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-600 mb-3">
                          현재 모금액
                        </label>
                        <input
                          type="number"
                          value={reportForm.supportCurrent}
                          onChange={(e) => setReportForm({ ...reportForm, supportCurrent: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                          placeholder="예) 250000"
                          min="0"
                        />
                        <p className="text-xs text-stone-500 mt-1">
                          목표 금액을 초과할 수 없습니다
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-600 mb-3">
                          후원 사용 목적 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={reportForm.supportDescription}
                          onChange={(e) => setReportForm({ ...reportForm, supportDescription: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                          placeholder="후원이 필요한 구체적인 이유와 사용 목적을 적어주세요"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-600 mb-3">은행</label>
                        <input
                          type="text"
                          value={reportForm.accountBank}
                          onChange={(e) => setReportForm({ ...reportForm, accountBank: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                          placeholder="예) 국민은행"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-600 mb-3">계좌번호</label>
                        <input
                          type="text"
                          value={reportForm.accountNumber}
                          onChange={(e) => setReportForm({ ...reportForm, accountNumber: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                          placeholder="예) 123-456-789012"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-600 mb-3">예금주</label>
                        <input
                          type="text"
                          value={reportForm.accountHolder}
                          onChange={(e) => setReportForm({ ...reportForm, accountHolder: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                          placeholder="예금주명"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 선교 사진 섹션 */}
                <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6 flex items-center">
                    <i className="ri-image-line mr-2"></i>
                    선교 썸네일 (1장, 선택사항)
                  </h3>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-stone-600 mb-3">
                      선교 대표 사진 업로드
                    </label>
                    <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-stone-400 transition-all duration-300 bg-white/50">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={reportForm.imagePreviews.length >= 1}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`cursor-pointer flex flex-col items-center ${
                          reportForm.imagePreviews.length >= 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center mb-4">
                          <i className="ri-upload-2-line text-white text-2xl"></i>
                        </div>
                        <p className="text-stone-700 font-medium mb-2">
                          {reportForm.imagePreviews.length >= 1 ? '최대 1장까지 업로드 가능합니다 (WebP 자동 변환)' : '클릭하여 사진을 업로드하세요'}
                        </p>
                        <p className="text-sm text-stone-500">
                          {reportForm.imagePreviews.length < 1 ? '1장 더 추가할 수 있습니다' : '업로드 완료'}
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* 이미지 갤러리 */}
                  {reportForm.imagePreviews.length > 0 && (
                      <div className="bg-white rounded-xl p-6 border border-stone-200">
                      <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-stone-800">
                          업로드된 사진 ({reportForm.imagePreviews.length}/1장) - WebP로 변환 후 업로드됩니다
                        </h4>
                        {reportForm.imagePreviews.length > 1 && (
                            <div className="text-sm text-stone-500">
                            {currentImageIndex + 1} / {reportForm.imagePreviews.length}
                          </div>
                        )}
                      </div>

                      {/* 메인 이미지 뷰어 */}
                      <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-4">
                        <div className="aspect-video relative">
                          <img
                            src={reportForm.imagePreviews[currentImageIndex]}
                            alt={`선교 사진 ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover object-top"
                          />

                          {/* 이미지 삭제 버튼 */}
                          <button
                            type="button"
                            onClick={() => removeImage(currentImageIndex)}
                            className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                          >
                            <i className="ri-close-line text-sm"></i>
                          </button>

                          {/* 이전/다음 버튼 */}
                          {reportForm.imagePreviews.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
                              >
                                <i className="ri-arrow-left-line text-xl"></i>
                              </button>
                              <button
                                type="button"
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
                              >
                                <i className="ri-arrow-right-line text-xl"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 썸네일 갤러리 */}
                      {reportForm.imagePreviews.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                          {reportForm.imagePreviews.map((image, index) => (
                            <button
                              type="button"
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                                currentImageIndex === index
                                  ? 'border-stone-700 shadow-lg scale-110'
                                  : 'border-gray-300 hover:border-stone-400'
                              }`}
                            >
                              <img src={image} alt={`썸네일 ${index + 1}`} className="w-full h-full object-cover object-top" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {reportForm.imagePreviews.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i className="ri-image-line text-gray-500 text-2xl"></i>
                      </div>
                      <p className="text-gray-500">선교 대표 사진을 추가해보세요 (선택사항)</p>
                      <p className="text-xs text-gray-400 mt-2">사진은 보고서의 썸네일로 사용됩니다</p>
                    </div>
                  )}
                </div>

                {/* 선교 개요 섹션 */}
                <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6 flex items-center">
                    <i className="ri-file-text-line mr-2"></i>
                    선교 개요
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-stone-600 mb-3">
                      선교 목적 및 계획 <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      content={reportForm.description}
                      onChange={(html) => setReportForm({ ...reportForm, description: html })}
                      placeholder="이번 선교의 목적, 주요 계획, 기대하는 바를 작성해주세요."
                      showToolbar={false}
                    />
                  </div>
                </div>

                {/* 개인정보 보호 */}
                <div className="flex items-center justify-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportForm.isAnonymous}
                      onChange={(e) => setReportForm({ ...reportForm, isAnonymous: e.target.checked })}
                      className="w-5 h-5 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 mr-3"
                    />
                    <span className="text-amber-700 font-medium">익명으로 작성하기</span>
                  </label>
                </div>

                {/* 선교 완료 */}
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportForm.isCompleted}
                      onChange={(e) =>
                        setReportForm({ ...reportForm, isCompleted: e.target.checked })
                      }
                      className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 mr-3"
                    />
                    <span className="text-emerald-700 font-medium">선교 완료</span>
                  </label>
                </div>

                {/* 안내 메시지 */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-stone-800 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="ri-lightbulb-line text-white text-xl"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800 mb-2">선교 일기서 작성 안내</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-stone-600">
                        <li>먼저 선교 일기서의 기본 정보와 썸네일을 만들어주세요</li>
                        <li>이후 매일의 선교 활동을 Day 1, Day 2 형태로 일기 작성이 가능합니다</li>
                        <li>업로드한 사진은 보고서 썸네일과 갤러리에서 사용됩니다</li>
                        <li>보고서 생성 후 언제든지 새로운 날의 기록을 추가할 수 있습니다</li>
                        <li>개인정보나 현지 상황에 민감한 정보는 포함하지 말아주세요</li>
                        <li>긴급한 기도나 후원이 필요한 경우 우선순위를 “긴급”으로 설정해주세요</li>
                        <li>
                          <span className="font-semibold text-stone-800">후원 설정 시 투명한 사용 내역을 제공하여 신뢰를 구축하세요</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex space-x-6 pt-8">
                  <Link
                    href="/missions"
                    className="flex-1 py-4 border-2 border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 transition-all duration-300 font-bold text-center whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line mr-2"></i>
                    목록으로 돌아가기
                  </Link>
                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      !reportForm.title.trim() ||
                      !reportForm.description ||
                      reportForm.description === '<p></p>' ||
                      !reportForm.country.trim() ||
                      !reportForm.startDate ||
                      !reportForm.endDate ||
                      !reportForm.missionaryName.trim()
                    }
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl hover:from-amber-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                  >
                    <i className="ri-book-open-line mr-2"></i>
                    {submitting
                      ? '저장 중...'
                      : isEditMode
                        ? '수정 내용 저장하기'
                        : '보고서 만들고 일기 시작하기'}
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
        onClose={() => router.push('/missions')}
      />
    </>
  );
}

export default function NewMissionReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f6f2]">
          <Header />
          <div className="py-16 text-center text-stone-500 text-sm">불러오는 중...</div>
          <Footer />
        </div>
      }
    >
      <NewMissionReportPageContent />
    </Suspense>
  );
}
