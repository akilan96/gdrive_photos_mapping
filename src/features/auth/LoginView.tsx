import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const login = useStudioStore((s) => s.login);
  const settings = useStudioStore((s) => s.settings);

  const [username, setUsername] = useState('studio');
  const [pin, setPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Please enter your studio username.');
      return;
    }
    if (!pin.trim()) {
      setError('Please enter your 4-digit PIN.');
      return;
    }

    const success = login(username, pin);
    if (success) {
      navigate('/dashboard');
    } else {
      setError(`Invalid credentials. Demo username is "studio" and PIN is "${settings.demoPin}".`);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center p-4 overflow-hidden bg-[#000F13]">
      {/* Cinematic Background Image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-[2px] scale-105"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80")',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#000F13] via-[#000F13]/85 to-[#000F13]/70" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#092328]/90 backdrop-blur-2xl border border-[#27555C] shadow-2xl shadow-black/80">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#006A70] to-[#50E2E5] text-black shadow-xl shadow-[#50E2E5]/25 mb-4">
            <Camera size={34} className="text-black" />
          </div>
          <h1 className="text-2xl font-black text-white font-heading tracking-wide uppercase">
            Mersal Media
          </h1>
          <p className="text-xs text-[#50E2E5] font-semibold tracking-widest uppercase mt-1">
            Studio Management Portal
          </p>
        </div>

        {/* Demo Credentials Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-[#50E2E5]/10 border border-[#50E2E5]/30 flex items-start gap-3">
          <Sparkles size={18} className="text-[#50E2E5] shrink-0 mt-0.5" />
          <div className="text-xs text-[#AEC5C7]">
            <p className="font-bold text-white mb-0.5">Quick Demo Access</p>
            <p>
              Username: <span className="font-mono text-[#50E2E5] font-bold">studio</span> &nbsp;|&nbsp;
              PIN: <span className="font-mono text-[#50E2E5] font-bold">{settings.demoPin}</span>
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#AEC5C7] uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="studio"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#000F13]/80 border border-[#27555C] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#50E2E5] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#AEC5C7] uppercase tracking-wider mb-2">
              4-Digit PIN
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234"
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#000F13]/80 border border-[#27555C] text-white text-sm tracking-widest placeholder-gray-500 focus:outline-none focus:border-[#50E2E5] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#AEC5C7]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#27555C] text-[#50E2E5] focus:ring-0"
              />
              <span>Remember session</span>
            </label>
            <span className="text-gray-500 text-[11px]">Local Demo Auth</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-[#50E2E5] to-[#3bc8cb] hover:from-[#65e8eb] hover:to-[#50E2E5] text-black shadow-xl shadow-[#50E2E5]/20 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01]"
          >
            <span>Enter Studio Portal</span>
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#27555C]/50 text-center">
          <p className="text-[11px] text-gray-400">
            Client Proofing Galleries do not require login.{' '}
            <button
              onClick={() => navigate('/gallery/rahul-priya-wedding')}
              className="text-[#50E2E5] hover:underline font-semibold"
            >
              Open Sample Client Gallery
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

