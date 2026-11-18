import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CalendarCheck,
  Camera,
  Scissors,
  BookOpen,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Users,
  Plus,
  CreditCard,
  Images,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStudioStore } from '../../stores/useStudioStore';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const events = useStudioStore((s) => s.events);
  const clients = useStudioStore((s) => s.clients);
  const payments = useStudioStore((s) => s.payments);
  const galleries = useStudioStore((s) => s.galleries);

  // 10 KPI Calculations
  const totalEvents = events.length;
  const upcomingEvents = events.filter(
    (e) => e.status === 'Booked' || e.status === 'Confirmed' || e.status === 'Shoot Scheduled'
  ).length;
  const completedEvents = events.filter((e) => e.status === 'Delivered').length;
  const ongoingShoots = events.filter((e) => e.status === 'Shoot In Progress').length;
  const pendingEditing = events.filter((e) => e.status === 'Editing').length;
  const pendingAlbumDelivery = events.filter(
    (e) => e.status === 'Album Designing' || e.status === 'Printing'
  ).length;

  const totalContractValue = events.reduce((sum, e) => sum + (e.finalAmount || 0), 0);
  const totalPaymentsReceived = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const outstandingBalance = Math.max(0, totalContractValue - totalPaymentsReceived);
  const totalClients = clients.length;

  const paymentCollectionPercentage =
    totalContractValue > 0
      ? Math.min(100, Math.round((totalPaymentsReceived / totalContractValue) * 100))
      : 0;

  // Monthly Revenue Data for Chart
  const monthlyRevenueData = [
    { month: 'Jun', revenue: 140000 },
    { month: 'Jul', revenue: 210000 },
    { month: 'Aug', revenue: 285000 },
    { month: 'Sep', revenue: 390000 },
    { month: 'Oct', revenue: 520000 },
    { month: 'Nov', revenue: totalPaymentsReceived > 500000 ? totalPaymentsReceived : 565000 },
  ];

  // Category Breakdown for Pie Chart
  const categoryCounts: Record<string, number> = {};
  events.forEach((e) => {
    categoryCounts[e.eventType] = (categoryCounts[e.eventType] || 0) + 1;
  });

  const categoryChartData = Object.keys(categoryCounts).map((type) => ({
    name: type,
    value: categoryCounts[type],
  }));

  const PIE_COLORS = ['#50E2E5', '#38bdf8', '#34d399', '#f59e0b', '#ec4899', '#a855f7'];

  // Upcoming shoots sorted by date
  const upcomingShootsList = [...events]
    .filter((e) => e.status !== 'Delivered' && e.status !== 'Cancelled')
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5);

  // Recent Payments
  const recentPaymentsList = [...payments]
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .slice(0, 5);

  // Pending Client Photo Selections
  const pendingSelectionsGalleries = galleries.filter(
    (g) => g.status === 'Selection In Progress' || g.status === 'Published'
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Header & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#27555C]/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#50E2E5]/15 text-[#50E2E5] border border-[#50E2E5]/30">
              TAMIL NADU STUDIO MANAGEMENT
            </span>
            <span className="text-xs text-gray-400">Chennai • Madurai • Coimbatore</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
            Studio Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#AEC5C7]">
            Overview of live photography productions, payment collections, and client photo proofing.
          </p>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/events/new')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#50E2E5] hover:bg-[#3bc8cb] text-black transition-all shadow-md shadow-[#50E2E5]/20"
          >
            <Plus size={15} />
            <span>Add Event</span>
          </button>
          <button
            onClick={() => navigate('/clients')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#092328] hover:bg-[#103840] text-white border border-[#27555C] transition-colors"
          >
            <Users size={15} className="text-[#50E2E5]" />
            <span>Add Client</span>
          </button>
          <button
            onClick={() => navigate('/payments')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#092328] hover:bg-[#103840] text-white border border-[#27555C] transition-colors"
          >
            <CreditCard size={15} className="text-emerald-400" />
            <span>Record Payment</span>
          </button>
          <button
            onClick={() => navigate('/galleries')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#092328] hover:bg-[#103840] text-white border border-[#27555C] transition-colors"
          >
            <Images size={15} className="text-purple-400" />
            <span>Create Gallery</span>
          </button>
          <button
            onClick={() => navigate('/calendar')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#092328] hover:bg-[#103840] text-white border border-[#27555C] transition-colors"
          >
            <CalendarDays size={15} className="text-amber-400" />
            <span>View Calendar</span>
          </button>
        </div>
      </div>

      {/* 10 KPI Cards Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#AEC5C7] mb-3 flex items-center gap-2">
          <span>Key Performance Indicators</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#50E2E5]" />
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <StatCard
            title="Total Events"
            value={totalEvents}
            icon={CalendarDays}
            color="cyan"
            onClick={() => navigate('/events')}
          />
          <StatCard
            title="Upcoming Shoots"
            value={upcomingEvents}
            icon={CalendarCheck}
            color="blue"
            trend="+2 this week"
            onClick={() => navigate('/events')}
          />
          <StatCard
            title="Completed"
            value={completedEvents}
            icon={CheckCircle2}
            color="green"
            onClick={() => navigate('/events')}
          />
          <StatCard
            title="Ongoing Shoots"
            value={ongoingShoots}
            icon={Camera}
            color="amber"
            onClick={() => navigate('/events')}
          />
          <StatCard
            title="Pending Editing"
            value={pendingEditing}
            icon={Scissors}
            color="purple"
            onClick={() => navigate('/workflow')}
          />
          <StatCard
            title="Pending Album"
            value={pendingAlbumDelivery}
            icon={BookOpen}
            color="amber"
            onClick={() => navigate('/workflow')}
          />
          <StatCard
            title="Total Contract"
            value={formatINR(totalContractValue)}
            icon={IndianRupee}
            color="cyan"
            onClick={() => navigate('/payments')}
          />
          <StatCard
            title="Received Payments"
            value={formatINR(totalPaymentsReceived)}
            icon={CheckCircle2}
            color="green"
            trend={`${paymentCollectionPercentage}% collected`}
            onClick={() => navigate('/payments')}
          />
          <StatCard
            title="Balance Due"
            value={formatINR(outstandingBalance)}
            icon={AlertCircle}
            color="red"
            trend="Action required"
            trendPositive={false}
            onClick={() => navigate('/payments')}
          />
          <StatCard
            title="Total Clients"
            value={totalClients}
            icon={Users}
            color="cyan"
            onClick={() => navigate('/clients')}
          />
        </div>
      </div>

      {/* Payment Collection Progress Bar */}
      <div className="p-5 rounded-2xl bg-[#092328]/80 border border-[#27555C] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs font-semibold text-white mb-2">
            <span className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#50E2E5]" />
              Overall Payment Collection Progress
            </span>
            <span className="text-[#50E2E5] font-black">{paymentCollectionPercentage}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#000F13] overflow-hidden border border-[#27555C]/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#006A70] via-[#50E2E5] to-emerald-400 transition-all duration-1000"
              style={{ width: `${paymentCollectionPercentage}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0 text-xs">
          <div>
            <p className="text-gray-400">Total Contract</p>
            <p className="font-bold text-white text-sm">{formatINR(totalContractValue)}</p>
          </div>
          <div>
            <p className="text-gray-400">Collected</p>
            <p className="font-bold text-emerald-400 text-sm">{formatINR(totalPaymentsReceived)}</p>
          </div>
          <div>
            <p className="text-gray-400">Outstanding</p>
            <p className="font-bold text-rose-400 text-sm">{formatINR(outstandingBalance)}</p>
          </div>
        </div>
      </div>

      {/* Charts Section: Monthly Revenue & Event Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#092328]/80 border border-[#27555C]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                Monthly Revenue Collection (INR)
              </h3>
              <p className="text-xs text-[#AEC5C7]">Payment inflows across recent wedding seasons</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#50E2E5]/10 text-[#50E2E5] font-bold">
              2026 Trend
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData}>
                <XAxis dataKey="month" stroke="#AEC5C7" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#AEC5C7"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#092328',
                    borderColor: '#27555C',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" fill="#50E2E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Category Breakdown Pie Chart */}
        <div className="p-6 rounded-2xl bg-[#092328]/80 border border-[#27555C] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-heading mb-1">
              Event Types Portfolio
            </h3>
            <p className="text-xs text-[#AEC5C7] mb-3">Shoot distribution by ceremony category</p>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#092328',
                      borderColor: '#27555C',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#27555C]/50 text-[11px]">
            {categoryChartData.slice(0, 4).map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-gray-300">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="truncate">{cat.name}:</span>
                <span className="font-bold text-white">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Section: Upcoming Shoots & Pending Client Selections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Shoots Timeline */}
        <div className="p-6 rounded-2xl bg-[#092328]/80 border border-[#27555C]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-[#50E2E5]" />
              <h3 className="text-sm font-bold text-white font-heading">Upcoming Shoots</h3>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="text-xs text-[#50E2E5] hover:underline flex items-center gap-1 font-semibold"
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingShootsList.map((evt) => {
              const client = clients.find((c) => c.id === evt.clientId);
              return (
                <div
                  key={evt.id}
                  onClick={() => navigate(`/events/${evt.id}`)}
                  className="p-3.5 rounded-xl bg-[#000F13]/60 border border-[#27555C]/60 hover:border-[#50E2E5]/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#50E2E5] transition-colors">
                        {evt.title}
                      </h4>
                      <p className="text-[11px] text-[#AEC5C7] mt-0.5">
                        {evt.venueName}, {evt.city}
                      </p>
                    </div>
                    <Badge variant={evt.priority === 'Urgent' ? 'red' : 'cyan'}>
                      {evt.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#27555C]/40 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {formatIndianDate(evt.eventDate)} ({evt.startTime})
                    </span>
                    <span className="font-semibold text-white">{formatINR(evt.finalAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Client Photo Proofing & Selections */}
        <div className="p-6 rounded-2xl bg-[#092328]/80 border border-[#27555C]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Images size={18} className="text-purple-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                Client Proofing Galleries
              </h3>
            </div>
            <button
              onClick={() => navigate('/galleries')}
              className="text-xs text-[#50E2E5] hover:underline flex items-center gap-1 font-semibold"
            >
              Manage <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-3">
            {galleries.slice(0, 4).map((gal) => (
              <div
                key={gal.id}
                onClick={() => navigate(`/galleries/${gal.id}`)}
                className="p-3.5 rounded-xl bg-[#000F13]/60 border border-[#27555C]/60 hover:border-purple-400/50 transition-all cursor-pointer group flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl bg-cover bg-center shrink-0 border border-[#27555C]"
                    style={{
                      backgroundImage: `url("${
                        gal.coverPhotoUrl ||
                        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80'
                      }")`,
                    }}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      {gal.title}
                    </h4>
                    <p className="text-[11px] text-[#AEC5C7] mt-0.5">
                      {gal.photos.length} Photos • Max {gal.maxFavourites} selects
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <Badge variant={gal.status === 'Submitted' ? 'green' : 'amber'}>
                    {gal.status}
                  </Badge>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {gal.selectedPhotoIds?.length || 0} selected
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payments Transaction Table */}
      <div className="p-6 rounded-2xl bg-[#092328]/80 border border-[#27555C]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-heading">
              Recent Payment Transactions
            </h3>
          </div>
          <button
            onClick={() => navigate('/payments')}
            className="text-xs text-[#50E2E5] hover:underline flex items-center gap-1 font-semibold"
          >
            All Accounts <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#000F13]/70 text-[#AEC5C7] uppercase font-bold border-b border-[#27555C]/70">
              <tr>
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Event / Client</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27555C]/40">
              {recentPaymentsList.map((pay) => {
                const event = events.find((e) => e.id === pay.eventId);
                const client = clients.find((c) => c.id === pay.clientId);
                return (
                  <tr key={pay.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-mono text-[#50E2E5]">{pay.id}</td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-white">{event?.title || 'Studio Shoot'}</p>
                      <p className="text-[11px] text-gray-400">{client?.fullName}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300">
                        {pay.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-400">{formatIndianDate(pay.paymentDate)}</td>
                    <td className="py-3 px-3 text-right font-black text-emerald-400 text-sm">
                      {formatINR(pay.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

