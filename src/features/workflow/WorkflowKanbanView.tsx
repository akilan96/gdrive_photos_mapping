import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { WORKFLOW_STAGES, WorkflowItem } from '../../types';
import { Badge } from '../../components/common/Badge';
import { formatIndianDate } from '../../utils/formatters';

export const WorkflowKanbanView: React.FC = () => {
  const navigate = useNavigate();
  const events = useStudioStore((s) => s.events);
  const workflows = useStudioStore((s) => s.workflows);
  const updateWorkflowItem = useStudioStore((s) => s.updateWorkflowItem);

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [viewType, setViewType] = useState<'timeline' | 'kanban'>('timeline');

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const eventWorkflows = workflows.filter((w) => w.eventId === selectedEventId);

  const handleStatusChange = (
    itemId: string,
    newStatus: 'Pending' | 'In Progress' | 'Completed' | 'Blocked'
  ) => {
    updateWorkflowItem(itemId, {
      status: newStatus,
      completedDate: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : undefined,
    });
  };

  const completedStagesCount = eventWorkflows.filter((w) => w.status === 'Completed').length;
  const progressPercent = Math.round((completedStagesCount / WORKFLOW_STAGES.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27555C]/50">
        <div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Production & Post-Processing Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-[#AEC5C7]">
            Track 14-stage studio workflow from shoot prep to raw ingest, photo proofing, editing, and album delivery.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#000F13] p-1 rounded-xl border border-[#27555C] text-xs">
            <button
              onClick={() => setViewType('timeline')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                viewType === 'timeline'
                  ? 'bg-[#50E2E5] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Timeline View
            </button>
            <button
              onClick={() => setViewType('kanban')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                viewType === 'kanban'
                  ? 'bg-[#50E2E5] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Stage Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Event Selector & Overall Milestone Progress */}
      <div className="p-5 rounded-2xl bg-[#092328]/85 border border-[#27555C] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
            Active Event Pipeline
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full max-w-lg px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white text-xs font-semibold focus:outline-none focus:border-[#50E2E5]"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.status})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6 text-xs shrink-0">
          <div>
            <p className="text-gray-400">Pipeline Completion</p>
            <p className="text-xl font-black text-[#50E2E5]">{progressPercent}%</p>
            <p className="text-[10px] text-gray-400">
              {completedStagesCount} of {WORKFLOW_STAGES.length} stages finished
            </p>
          </div>
          <div className="w-24 h-2.5 rounded-full bg-[#000F13] overflow-hidden border border-[#27555C]">
            <div
              className="h-full bg-gradient-to-r from-[#006A70] to-[#50E2E5]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline View: 14 Ordered Stages */}
      {viewType === 'timeline' && (
        <div className="space-y-3">
          {WORKFLOW_STAGES.map((stage) => {
            const workflowItem = eventWorkflows.find((w) => w.stageId === stage.id);
            const status = workflowItem?.status || 'Pending';

            return (
              <div
                key={stage.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  status === 'Completed'
                    ? 'bg-[#000F13]/40 border-emerald-500/30 text-gray-300'
                    : status === 'In Progress'
                    ? 'bg-[#50E2E5]/5 border-[#50E2E5]/50 text-white shadow-lg shadow-[#50E2E5]/5'
                    : status === 'Blocked'
                    ? 'bg-rose-500/10 border-rose-500/40 text-gray-300'
                    : 'bg-[#092328]/60 border-[#27555C]/40 text-gray-400'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      status === 'Completed'
                        ? 'bg-emerald-500 text-black'
                        : status === 'In Progress'
                        ? 'bg-[#50E2E5] text-black animate-pulse'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {status === 'Completed' ? <Check size={16} /> : stage.id}
                  </span>

                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Stage {stage.id}: {stage.name}
                    </h4>
                    <p className="text-[11px] text-[#AEC5C7]">
                      {workflowItem?.notes || `Production milestone ${stage.name}`}
                    </p>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {(['Pending', 'In Progress', 'Completed', 'Blocked'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => workflowItem && handleStatusChange(workflowItem.id, s)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        status === s
                          ? s === 'Completed'
                            ? 'bg-emerald-500 text-black'
                            : s === 'In Progress'
                            ? 'bg-[#50E2E5] text-black'
                            : s === 'Blocked'
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/20 text-white'
                          : 'bg-white/5 hover:bg-white/10 text-gray-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stage Matrix View */}
      {viewType === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['Pending', 'In Progress', 'Completed', 'Blocked'] as const).map((col) => {
            const items = eventWorkflows.filter((w) => w.status === col);
            return (
              <div
                key={col}
                className="p-4 rounded-2xl bg-[#092328]/85 border border-[#27555C] flex flex-col"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#27555C]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">{col}</h4>
                  <span className="w-5 h-5 rounded-full bg-[#000F13] text-gray-300 text-[10px] font-bold flex items-center justify-center">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {items.map((it) => {
                    const st = WORKFLOW_STAGES.find((s) => s.id === it.stageId);
                    return (
                      <div
                        key={it.id}
                        className="p-3 rounded-xl bg-[#000F13] border border-[#27555C] text-xs space-y-2"
                      >
                        <p className="font-bold text-white">
                          #{it.stageId} {st?.name}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-[#27555C]/40 text-[10px]">
                          <span className="text-gray-400">Change:</span>
                          <select
                            value={it.status}
                            onChange={(e) => handleStatusChange(it.id, e.target.value as any)}
                            className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-gray-300"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Blocked">Blocked</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

