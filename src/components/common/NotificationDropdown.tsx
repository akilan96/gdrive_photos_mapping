import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { formatDateTime } from '../../utils/formatters';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const notifications = useStudioStore((s) => s.notifications);
  const markAsRead = useStudioStore((s) => s.markNotificationRead);
  const markAllAsRead = useStudioStore((s) => s.markAllNotificationsRead);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 p-4 rounded-2xl bg-[#092328] border border-[#27555C] shadow-2xl backdrop-blur-xl animate-fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-[#27555C]">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-[#50E2E5]" />
          <h4 className="text-sm font-bold text-white">Notifications</h4>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#50E2E5] text-black">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-1 text-xs text-[#50E2E5] hover:underline"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-[#27555C]/50 mt-2 pr-1">
        {notifications.length === 0 ? (
          <p className="text-xs text-center text-gray-400 py-6">No notifications right now.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.link) {
                  navigate(n.link);
                  onClose();
                }
              }}
              className={`p-3 rounded-xl transition-colors cursor-pointer ${
                n.read ? 'hover:bg-white/5 opacity-70' : 'bg-[#50E2E5]/5 hover:bg-[#50E2E5]/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-xs font-semibold text-white">{n.title}</h5>
                {!n.read && <span className="w-2 h-2 rounded-full bg-[#50E2E5] shrink-0 mt-1" />}
              </div>
              <p className="text-xs text-[#AEC5C7] mt-1 leading-relaxed">{n.message}</p>
              <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {formatDateTime(n.createdAt)}
                </span>
                {n.link && (
                  <span className="text-[#50E2E5] flex items-center gap-0.5">
                    View <ExternalLink size={10} />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

