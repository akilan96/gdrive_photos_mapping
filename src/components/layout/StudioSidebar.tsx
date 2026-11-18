import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CreditCard,
  Camera,
  FolderKanban,
  Images,
  Settings,
  Sparkles,
  Layers,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';

interface StudioSidebarProps {
  onCloseMobile?: () => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({ onCloseMobile }) => {
  const events = useStudioStore((s) => s.events);
  const galleries = useStudioStore((s) => s.galleries);
  const logout = useStudioStore((s) => s.logout);

  const pendingSelections = galleries.filter((g) => g.status === 'Selection In Progress').length;
  const activeEvents = events.filter((e) => e.status !== 'Delivered' && e.status !== 'Cancelled').length;

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/events', label: 'Events & Shoots', icon: CalendarDays, badge: activeEvents },
    { to: '/clients', label: 'Client Directory', icon: Users },
    { to: '/calendar', label: 'Shoot Calendar', icon: CalendarDays },
    { to: '/payments', label: 'Payments & Accounts', icon: CreditCard },
    { to: '/galleries', label: 'Client Proofing', icon: Images, badge: pendingSelections || undefined, badgeColor: 'accent' },
    { to: '/workflow', label: 'Production Pipeline', icon: FolderKanban },
    { to: '/equipment', label: 'Equipment Inventory', icon: Camera },
    { to: '/team', label: 'Studio Crew', icon: Layers },
    { to: '/settings', label: 'Settings & Backup', icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-[#000F13] border-r border-[#27555C]/70 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#27555C]/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006A70] to-[#50E2E5] flex items-center justify-center text-black font-black shadow-lg shadow-[#50E2E5]/20">
            <Camera size={22} className="text-black" />
          </div>
          <div>
            <h1 className="text-base font-black text-white font-heading tracking-wide uppercase">
              Mersal Media
            </h1>
            <p className="text-[10px] text-[#50E2E5] font-semibold tracking-wider uppercase">
              Studio Suite
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-210px)]">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#50E2E5]/15 text-[#50E2E5] border border-[#50E2E5]/30 shadow-[0_0_15px_rgba(80,226,229,0.1)]'
                      : 'text-[#AEC5C7] hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      item.badgeColor === 'accent'
                        ? 'bg-[#50E2E5] text-black animate-pulse'
                        : 'bg-[#27555C] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info & Logout */}
      <div className="p-4 border-t border-[#27555C]/50 bg-[#092328]/40">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#50E2E5]/20 border border-[#50E2E5]/40 flex items-center justify-center text-xs font-bold text-[#50E2E5]">
              AS
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">Akilan S.</p>
              <p className="text-[10px] text-[#AEC5C7] mt-0.5">Studio Director</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Log Out"
            className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>

        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-[11px] text-[#AEC5C7]">
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#50E2E5]" /> Demo Mode
          </span>
          <span className="text-[10px] text-emerald-400 font-medium">Offline Active</span>
        </div>
      </div>
    </aside>
  );
};

