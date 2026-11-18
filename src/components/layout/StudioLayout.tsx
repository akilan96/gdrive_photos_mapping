import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { StudioSidebar } from './StudioSidebar';
import { StudioNavbar } from './StudioNavbar';
import { LayoutDashboard, CalendarDays, Users, Images, CreditCard } from 'lucide-react';

export const StudioLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const mobileNavItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/events', label: 'Events', icon: CalendarDays },
    { to: '/galleries', label: 'Proofing', icon: Images },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/clients', label: 'Clients', icon: Users },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#000F13] text-[#F6FAFA]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-full">
        <StudioSidebar />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 h-full bg-[#000F13]">
            <StudioSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <StudioNavbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#000F13]/95 backdrop-blur-lg border-t border-[#27555C] flex items-center justify-around px-2 z-30">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
                  active ? 'text-[#50E2E5] scale-105' : 'text-[#AEC5C7] hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

