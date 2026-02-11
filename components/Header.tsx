'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LoginModal from './LoginModal';
import { useAuth } from './AuthProvider';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { userData, loading: authLoading, signOut } = useAuth();
  const loggedIn = !!userData;

  const navigation = [
    { name: '홈', href: '/' },
    { name: '기도 제목', href: '/prayers' },
    { name: '감사일기', href: '/gratitude' },
    { name: '선교 일기', href: '/missions' },
    { name: '소개', href: '/about' }
  ];

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="bg-[#F8F6F2]/95 backdrop-blur-sm sticky top-0 z-50 border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
                  <img 
                    src="https://static.readdy.ai/image/aa1565715a7c63aa7d986d857e515b00/0028fe73c321e07de5a22418a2640a3c.png"
                    alt="기도의 집 로고"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-['Pacifico'] text-base sm:text-lg lg:text-xl text-stone-600">
                  기도의 집
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-6 lg:space-x-10">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-light tracking-wide transition-colors duration-500 ${
                    pathname === item.href
                      ? 'text-amber-700'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <span
                    className={`px-2.5 py-1 rounded-full ${
                      pathname === item.href
                        ? ''
                        : ''
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {!authLoading && loggedIn ? (
                <>
                  <Link href="/profile" className="text-stone-400 hover:text-stone-600 transition-colors duration-500 flex items-center space-x-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-user-line text-base"></i>
                    </div>
                    <span className="text-sm font-light">{userData?.name || '사용자'}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-stone-400 hover:text-stone-600 text-sm font-light tracking-wide transition-colors duration-500 border-b border-stone-200 hover:border-stone-400 pb-0.5 cursor-pointer whitespace-nowrap"
                  >
                    로그아웃
                  </button>
                </>
              ) : !authLoading ? (
                <>
                  <Link href="/profile" className="text-stone-400 hover:text-stone-600 transition-colors duration-500">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-user-line text-base"></i>
                    </div>
                  </Link>
                  <button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-stone-500 hover:text-stone-700 text-sm font-light tracking-wide transition-colors duration-500 border-b border-stone-300 hover:border-stone-500 pb-0.5 cursor-pointer whitespace-nowrap"
                  >
                    로그인
                  </button>
                </>
              ) : (
                <div className="w-32 h-5"></div>
              )}
            </div>

            <div className="md:hidden flex items-center space-x-3">
              {loggedIn && (
                <Link href="/profile" className="text-stone-400 hover:text-stone-600 transition-colors duration-500">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-user-line text-lg"></i>
                  </div>
                </Link>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-stone-500 hover:text-stone-700 focus:outline-none transition-colors duration-500 cursor-pointer p-1"
                aria-label="메뉴"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className={`text-2xl ${isMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
                </div>
              </button>
            </div>
          </div>

          <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="py-4 space-y-1 border-t border-stone-100/60">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-2 py-3.5 text-base font-light rounded-lg tracking-wide transition-all duration-300 ${
                    pathname === item.href
                      ? 'text-amber-700 bg-amber-100/70 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-2 pt-4 mt-2 border-t border-stone-100/60">
                {loggedIn ? (
                  <div className="space-y-3">
                    <div className="text-base text-stone-600 font-light">
                      안녕하세요, {userData?.name || '사용자'}님
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-stone-500 hover:text-stone-700 text-base font-light tracking-wide transition-colors duration-500 border-b border-stone-300 pb-0.5 cursor-pointer"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="text-stone-600 hover:text-stone-800 text-base font-light tracking-wide transition-colors duration-500 border-b border-stone-400 pb-0.5 cursor-pointer"
                  >
                    로그인
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
