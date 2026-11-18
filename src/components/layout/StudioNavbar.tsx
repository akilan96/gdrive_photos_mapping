import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  ExternalLink,
  CreditCard,
  CalendarPlus,
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { NotificationDropdown } from '../common/NotificationDropdown';

interface StudioNavbarProps {
  onToggleMobileMenu: () => void;
  onOpenNewEventModal?: () => void;
  onOpenNewPaymentModal?: () => void;
}

export const StudioNavbar: React.FC<StudioNavbarProps> = ({
  onToggleMobileMenu,
  onOpenNewEventModal,
  onOpenNewPaymentModal,
}) => {
  const navigate = useNavigate();
  const settings = useStudioStore((s) => s.settings);
  const toggleTheme = useStudioStore((s) => s.toggleTheme);
  const notifications = useStudioStore((s) => s.notifications);
  const galleries = useStudioStore((s) => s.galleries);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const sampleGallery = galleries[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-[#000F13]/90 backdrop-blur-md border-b border-[#27555C]/70 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile Toggle + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 text-gray-300 hover:text-white lg:hidden rounded-lg hover:bg-white/5"
        >
          <Menu size={20} />
        </button>

        <form onSubmit={handleSearch} className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events, clients, venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#092328] border border-[#27555C] text-white placeholder-gray-400 focus:outline-none focus:border-[#50E2E5] transition-all"
          />
        </form>
      </div>

      {/* Right: Quick Actions + Icons */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Demo Customer Portal button */}
        {sampleGallery && (
          <button
            onClick={() => window.open(`/gallery/${sampleGallery.shareId}`, '_blank')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#50E2E5]/10 hover:bg-[#50E2E5]/20 text-[#50E2E5] border border-[#50E2E5]/30 transition-all shadow-sm"
            title="Preview Customer Photo Selection Portal in new tab"
          >
            <span>Customer View</span>
            <ExternalLink size={13} />
          </button>
        )}

        {/* Quick Add Event */}
        <button
          onClick={() => (onOpenNewEventModal ? onOpenNewEventModal() : navigate('/events/new'))}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#50E2E5] hover:bg-[#3bc8cb] text-black transition-all shadow-lg shadow-[#50E2E5]/20"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add Event</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
          >
            <Bell size={18} />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#50E2E5] text-black text-[10px] font-black flex items-center justify-center">
                {unreadNotifs}
              </span>
            )}
          </button>

          <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
        >
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};

