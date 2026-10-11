import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, User, MessageSquareText, ClipboardList } from 'lucide-react';
import ScrollToTop from '../components/ScrollToTop';
import { useLanguage } from '../context/LanguageContext';

const PatientLayout = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: '/patient/home', icon: <Home className="w-6 h-6" />, label: t('nav_home') },
    { path: '/patient/profile', icon: <User className="w-6 h-6" />, label: t('nav_profile') },
    { path: '/patient/advice', icon: <MessageSquareText className="w-6 h-6" />, label: t('nav_advice') },
    { path: '/patient/history', icon: <ClipboardList className="w-6 h-6" />, label: t('nav_history') }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-surface">
      <ScrollToTop />
      
      {/* Top Header */}
      <header className="bg-primary text-white p-4 shadow-md rounded-b-2xl sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('app_title')}</h1>
          <div className="bg-white/20 p-2 rounded-full">
            <User className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 pb-28">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] rounded-t-2xl z-20 pb-safe">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-xl min-w-[72px] transition-colors ${
                  isActive 
                    ? 'text-primary font-bold' 
                    : 'text-neutral-muted hover:text-primary-dark'
                }`}
              >
                <div className={`p-1.5 rounded-full transition-all ${isActive ? 'bg-primary-light/50' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-sm mt-1 text-center font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default PatientLayout;
