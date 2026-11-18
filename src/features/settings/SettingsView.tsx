import React, { useState, useRef } from 'react';
import {
  Settings,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  Camera,
  CheckCircle,
  AlertTriangle,
  Lock,
  LogOut,
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { downloadJson } from '../../utils/formatters';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const SettingsView: React.FC = () => {
  const settings = useStudioStore((s) => s.settings);
  const updateSettings = useStudioStore((s) => s.updateSettings);
  const toggleTheme = useStudioStore((s) => s.toggleTheme);
  const updatePin = useStudioStore((s) => s.updatePin);
  const exportBackupJson = useStudioStore((s) => s.exportBackupJson);
  const restoreBackupJson = useStudioStore((s) => s.restoreBackupJson);
  const resetDemoData = useStudioStore((s) => s.resetDemoData);
  const logout = useStudioStore((s) => s.logout);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Studio Profile Form
  const [studioName, setStudioName] = useState(settings.studioName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // PIN Form
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      studioName,
      tagline,
      phone,
      email,
      address,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      alert('PIN must be at least 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      alert('PIN confirmation does not match.');
      return;
    }

    updatePin(newPin);
    setNewPin('');
    setConfirmPin('');
    setPinMessage('PIN updated successfully! Use your new PIN for future logins.');
    setTimeout(() => setPinMessage(null), 3500);
  };

  const handleBackup = () => {
    const jsonStr = exportBackupJson();
    downloadJson(
      `Mersal_Media_Studio_Backup_${new Date().toISOString().split('T')[0]}.json`,
      jsonStr
    );
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = restoreBackupJson(content);
      if (success) {
        alert('Studio data restored successfully from backup file!');
      } else {
        alert('Invalid backup file. Please upload a valid Mersal Media Studio backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27555C]/50">
        <div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Studio Settings & Data Management
          </h1>
          <p className="text-xs sm:text-sm text-[#AEC5C7]">
            Configure studio branding, demo access PIN, appearance theme, and complete local database backups.
          </p>
        </div>

        <button
          onClick={() => logout()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors self-start sm:self-auto"
        >
          <LogOut size={15} />
          <span>Studio Logout</span>
        </button>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={16} />
          <span>Studio settings updated and saved to local storage!</span>
        </div>
      )}

      {/* 1. Studio Profile & Branding */}
      <div className="p-6 rounded-3xl bg-[#092328]/85 border border-[#27555C] space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
          <Camera size={16} className="text-[#50E2E5]" /> Studio Profile & Branding
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Studio Name</label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-300 font-semibold mb-1">Studio Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 font-bold bg-[#50E2E5] hover:bg-[#3bc8cb] text-black rounded-xl shadow-lg shadow-[#50E2E5]/20"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2. Theme & Appearance */}
      <div className="p-6 rounded-3xl bg-[#092328]/85 border border-[#27555C] space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
          {settings.theme === 'dark' ? <Moon size={16} className="text-[#50E2E5]" /> : <Sun size={16} className="text-amber-400" />}
          Appearance Theme
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white">Current Theme: {settings.theme === 'dark' ? 'Cinematic Dark Teal' : 'Clean Studio Light'}</p>
            <p className="text-gray-400 text-[11px] mt-0.5">Toggle between dark cinematic studio mode and light proofing theme.</p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
          >
            {settings.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>Switch to {settings.theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </div>

      {/* 3. Demo Access PIN */}
      <div className="p-6 rounded-3xl bg-[#092328]/85 border border-[#27555C] space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
          <Lock size={16} className="text-amber-400" /> Change Demo Access PIN
        </h3>
        <p className="text-gray-400 text-[11px]">
          Current Studio Demo PIN: <strong className="text-[#50E2E5] font-mono">{settings.demoPin}</strong>
        </p>

        {pinMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            {pinMessage}
          </div>
        )}

        <form onSubmit={handleChangePin} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">New 4-Digit PIN</label>
            <input
              type="password"
              maxLength={8}
              placeholder="e.g. 5678"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white tracking-widest focus:outline-none focus:border-[#50E2E5]"
            />
          </div>
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Confirm New PIN</label>
            <input
              type="password"
              maxLength={8}
              placeholder="e.g. 5678"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white tracking-widest focus:outline-none focus:border-[#50E2E5]"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-xl"
            >
              Update PIN
            </button>
          </div>
        </form>
      </div>

      {/* 4. Complete Data Backup, Restore & Reset */}
      <div className="p-6 rounded-3xl bg-[#092328]/85 border border-[#27555C] space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
          <Download size={16} className="text-purple-400" /> Database Backup & Recovery
        </h3>
        <p className="text-gray-400 text-[11px] leading-relaxed">
          All client, event, payment, equipment, and gallery records are stored directly in your
          browser's local storage. You can download a complete JSON snapshot to archive or transfer to another device.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-[#50E2E5] hover:bg-[#3bc8cb] text-black shadow-lg shadow-[#50E2E5]/20"
          >
            <Download size={15} />
            <span>Download Full Backup (JSON)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleRestoreFile}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10"
          >
            <Upload size={15} />
            <span>Restore from File</span>
          </button>

          <button
            onClick={() => setConfirmResetOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 ml-auto"
          >
            <RotateCcw size={15} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        title="Reset Entire Demo Database"
        message="Are you sure you want to reset all data back to the original Tamil Nadu demo dataset? Any custom events or clients you added will be restored to defaults."
        confirmLabel="Reset All Data"
        variant="danger"
        onConfirm={() => {
          resetDemoData();
          setConfirmResetOpen(false);
          alert('Demo data has been reset to defaults.');
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
};

