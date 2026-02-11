'use client';

import { useState } from 'react';

type ProfileData = {
  name: string;
  birth_year: number | null;
  church: string;
};

type Props = {
  initialData: ProfileData;
  onSubmit: (data: ProfileData) => Promise<void>;
  isOnboarding?: boolean;
};

const currentYear = new Date().getFullYear();

export default function ProfileSetupForm({ initialData, onSubmit, isOnboarding = false }: Props) {
  const [name, setName] = useState(initialData.name);
  const [birthYear, setBirthYear] = useState(initialData.birth_year?.toString() ?? '');
  const [church, setChurch] = useState(initialData.church ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        birth_year: birthYear ? parseInt(birthYear, 10) : null,
        church: church.trim(),
      });
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      {isOnboarding && (
        <div className="mb-8">
          <h2 className="text-2xl font-light text-stone-900 mb-2">프로필을 설정해주세요</h2>
          <p className="text-stone-500 text-sm">처음 방문을 환영합니다. 기본 정보를 입력해주세요.</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
          이름 <span className="text-amber-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="birth_year" className="block text-sm font-medium text-stone-700 mb-2">
          출생년도
        </label>
        <input
          id="birth_year"
          type="number"
          min={1900}
          max={currentYear}
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          placeholder={`예: ${currentYear - 30}`}
          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="church" className="block text-sm font-medium text-stone-700 mb-2">
          교회
        </label>
        <input
          id="church"
          type="text"
          value={church}
          onChange={(e) => setChurch(e.target.value)}
          placeholder="출석 중인 교회명을 입력하세요"
          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '저장 중...' : isOnboarding ? '시작하기' : '저장하기'}
      </button>
    </form>
  );
}
