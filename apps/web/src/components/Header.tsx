import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { ShieldCheck, Cpu, Plus, Menu, X, CheckCircle2, AlertCircle } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'create' | 'saved' | 'status' | 'review';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  savedCount: number;
  modelReady: boolean;
  modelId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
  modelReady,
  modelId,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'create', label: 'New Observation' },
    { id: 'saved', label: 'Saved Reports', count: savedCount },
    { id: 'status', label: 'System Status' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-warm-panel border-b border-warm-border">
      <div className="bg-[#F4F6F3] border-b border-warm-border px-4 py-1 text-[11px] font-mono text-charcoal-muted flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>
          <span>Enclave #GS-NODE-8942 · Hardware NPU Active · 0 bytes dispatched external</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-forest flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3 h-3 text-sage" /> 100% PRIVATE / LOCAL EDGE
          </span>
          <span className="hidden sm:inline">Loopback TCP :12434</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <BrandLogo size={36} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-forest group-hover:text-forest-dark transition-colors">
                  GroundSignal
                </span>
                <span className="text-[10px] font-mono bg-sage-light text-forest px-1.5 py-0.5 rounded border border-sage-border font-medium">
                  v1.4
                </span>
              </div>
              <p className="text-[11px] text-charcoal-muted hidden sm:block">
                Local AI. Real-world impact.
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors relative flex items-center gap-1.5 ${
                    isActive
                      ? 'text-forest font-semibold bg-sage-light/60'
                      : 'text-charcoal-muted hover:text-charcoal hover:bg-black/5'
                  }`}
                >
                  {item.label}
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-forest text-white'
                          : 'bg-warm-border text-charcoal-muted'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-forest rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => onSelectTab('status')}
              title="Click to view local model status & diagnostics"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all ${
                modelReady
                  ? 'bg-sage-light text-forest border-sage-border hover:bg-sage-light/80'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  modelReady
                    ? 'bg-emerald-600 animate-pulse'
                    : 'bg-amber-500'
                }`}
              />
              <Cpu className="w-3 h-3 text-sage-dark" />
              <span className="font-medium">
                {modelReady
                  ? `Ready · ${modelId ? modelId.split('/').pop()?.split(':')[0] || 'Llama 3.2' : 'Llama 3.2'}`
                  : 'Runner Offline'}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('create')}
              className="flex items-center gap-1 bg-forest hover:bg-forest-dark text-white px-3 py-1.5 rounded text-sm font-medium transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Observation</span>
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onSelectTab('status')}
              className={`p-1.5 rounded-full border ${
                modelReady ? 'bg-sage-light border-sage-border' : 'bg-amber-50 border-amber-200'
              }`}
            >
              {modelReady ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal hover:bg-warm-border/50 rounded-md"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-warm-border bg-warm-panel px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between ${
                activeTab === item.id
                  ? 'bg-sage-light text-forest font-semibold'
                  : 'text-charcoal hover:bg-warm-canvas'
              }`}
            >
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-forest text-white font-mono">
                  {item.count}
                </span>
              )}
            </button>
          ))}
          <div className="pt-2 border-t border-warm-border">
            <button
              onClick={() => {
                onSelectTab('create');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 bg-forest text-white py-2 rounded text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Observation
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
