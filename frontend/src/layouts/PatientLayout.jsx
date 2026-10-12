import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, User, MessageSquareText, ClipboardList, Settings, HeartPulse, Stethoscope } from 'lucide-react';
import ScrollToTop from '../components/ScrollToTop';
import { useLanguage } from '../context/LanguageContext';

const PatientLayout = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: '/patient/home', icon: <Home className="w-5 h-5" />, label: t('nav_home') },
    { path: '/patient/advice', icon: <MessageSquareText className="w-5 h-5" />, label: t('nav_advice') },
    { path: '/patient/history', icon: <ClipboardList className="w-5 h-5" />, label: t('nav_history') },
    { path: '/patient/profile', icon: <User className="w-5 h-5" />, label: t('nav_profile') }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70">
      <ScrollToTop />

      <header className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-sm sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">

          <Link to="/patient/home" className="flex items-center gap-3.5 active:scale-95 transition-transform group">
            <img
              src="/images/logo_emblem.png"
              alt="SwasthyaSetu Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-105 transition-transform drop-shadow-md"
            />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
              {t('app_title')}
            </h1>
          </Link>

          {/* Desktop Navigation Menu (hidden on mobile, visible on md+) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/15 backdrop-blur-sm">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons (Doctor Portal, Language/Settings & Profile) */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/doctor/dashboard"
              className="px-2.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white border border-white/20 shadow-sm flex items-center justify-center gap-1.5"
              title="Doctor Portal"
              aria-label="Doctor Portal"
            >
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200" />
              <span className="hidden sm:inline text-xs font-bold">Doctor Portal</span>
            </Link>
            <Link
              to="/patient/settings"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/15 shadow-sm"
              title={t('language')}
              aria-label={t('language')}
            >
              <Settings className="w-5 h-5" />
            </Link>
            <Link
              to="/patient/profile"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/15 shadow-sm flex items-center justify-center"
              title={t('profile')}
              aria-label={t('profile')}
            >
              <User className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile Only (hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-8px_25px_-5px_rgba(0,0,0,0.06)] rounded-t-3xl z-30 pb-safe">
        <div className="flex justify-around items-center px-3 py-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-1.5 px-3 rounded-2xl min-w-[70px] transition-all duration-200 active:scale-95 ${isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-emerald-50 text-emerald-600 scale-105 shadow-sm'
                  : 'hover:bg-slate-50'
                  }`}>
                  {item.icon}
                </div>
                <span className="text-xs mt-1 text-center font-medium tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default PatientLayout;
