import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, User, MessageSquareText, ClipboardList, Settings, HeartPulse } from 'lucide-react';
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

      {/* Top Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-sm sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link to="/patient/home" className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-sm">
              <HeartPulse className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight">{t('app_title')}</h1>
              <div className="flex items-center gap-1.5 text-emerald-100 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                <span>SwasthyaSetu {t('rural_health_tag')}</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Menu (hidden on mobile, visible on md+) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/15 backdrop-blur-sm">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive 
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

          {/* Right Action Icons (Language/Settings & Profile) */}
          <div className="flex items-center gap-2.5">
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

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-28 md:pb-12">
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
                className={`flex flex-col items-center py-1.5 px-3 rounded-2xl min-w-[70px] transition-all duration-200 active:scale-95 ${
                  isActive 
                    ? 'text-emerald-700 font-bold' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive 
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
