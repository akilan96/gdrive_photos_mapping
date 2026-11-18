import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  AlertTriangle,
  Users,
  Camera,
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { EventItem, EventType } from '../../types';
import { Badge } from '../../components/common/Badge';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const CalendarView: React.FC = () => {
  const navigate = useNavigate();
  const events = useStudioStore((s) => s.events);
  const clients = useStudioStore((s) => s.clients);

  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // November 2026
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date(2026, 10, 18));

  // Detect potential overlapping dates
  const dateCounts: Record<string, EventItem[]> = {};
  events.forEach((evt) => {
    dateCounts[evt.eventDate] = [...(dateCounts[evt.eventDate] || []), evt];
  });

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const filteredEvents = events.filter((e) =>
    selectedEventType === 'ALL' ? true : e.eventType === selectedEventType
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27555C]/50">
        <div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Shoot & Ceremony Calendar
          </h1>
          <p className="text-xs sm:text-sm text-[#AEC5C7]">
            Visual timeline of scheduled wedding ceremonies, pre-shoots, and crew allocations.
          </p>
        </div>

        {/* Month Navigation & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#092328] rounded-xl border border-[#27555C] p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/5"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-bold text-white min-w-[130px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/5"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
          >
            Today
          </button>

          <div className="flex items-center bg-[#000F13] p-1 rounded-xl border border-[#27555C] text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                viewMode === 'month' ? 'bg-[#50E2E5] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                viewMode === 'list' ? 'bg-[#50E2E5] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid View */}
      {viewMode === 'month' && (
        <div className="rounded-3xl bg-[#092328]/85 border border-[#27555C] overflow-hidden shadow-2xl">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 bg-[#000F13] border-b border-[#27555C] text-center text-xs font-bold text-[#AEC5C7] py-3">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#27555C]/40">
            {/* Empty cells before month start */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[110px] p-2 bg-[#000F13]/30" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                day
              ).padStart(2, '0')}`;
              const dayEvents = dateCounts[dateKey] || [];
              const isToday = day === 18 && month === 10; // Demo Today is Nov 18, 2026
              const hasConflict = dayEvents.length > 1;

              return (
                <div
                  key={day}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                    isToday ? 'bg-[#50E2E5]/5' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[#50E2E5] text-black font-black'
                          : 'text-gray-300'
                      }`}
                    >
                      {day}
                    </span>

                    {hasConflict && (
                      <span
                        title="Multiple bookings on same date! Check gear and staff availability."
                        className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-full border border-amber-500/30"
                      >
                        <AlertTriangle size={10} /> 2 Shoots
                      </span>
                    )}
                  </div>

                  {/* Events on this day */}
                  <div className="space-y-1 overflow-y-auto max-h-20">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => navigate(`/events/${evt.id}`)}
                        className="px-2 py-1 rounded-md text-[10px] font-bold bg-[#50E2E5]/15 text-[#50E2E5] border border-[#50E2E5]/30 hover:bg-[#50E2E5]/25 truncate cursor-pointer transition-colors"
                        title={`${evt.title} (${evt.startTime})`}
                      >
                        <span className="font-mono text-gray-400 mr-1">{evt.startTime}</span>
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredEvents
            .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
            .map((evt) => {
              const client = clients.find((c) => c.id === evt.clientId);
              return (
                <div
                  key={evt.id}
                  onClick={() => navigate(`/events/${evt.id}`)}
                  className="p-4 rounded-2xl bg-[#092328] border border-[#27555C] hover:border-[#50E2E5]/50 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center px-3 py-2 rounded-xl bg-[#000F13] border border-[#27555C] shrink-0">
                      <p className="text-[10px] uppercase font-bold text-[#50E2E5]">
                        {new Date(evt.eventDate).toLocaleString('default', { month: 'short' })}
                      </p>
                      <p className="text-lg font-black text-white">
                        {new Date(evt.eventDate).getDate()}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white hover:text-[#50E2E5] transition-colors">
                        {evt.title}
                      </h4>
                      <p className="text-gray-400 mt-0.5">
                        Client: {client?.fullName} • {evt.venueName}, {evt.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <span className="text-gray-400 flex items-center gap-1 font-mono">
                      <Clock size={12} /> {evt.startTime} - {evt.endTime}
                    </span>
                    <Badge variant="cyan">{evt.status}</Badge>
                    <span className="font-bold text-white">{formatINR(evt.finalAmount)}</span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

