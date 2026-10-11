import React from 'react';
import { Lock, HardDrive, Shield } from 'lucide-react';

interface FooterProps {
  onOpenStatus: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenStatus }) => {
  return (
    <footer className="border-t border-warm-border bg-warm-canvas py-8 text-xs text-charcoal-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 p-3.5 bg-warm-panel border border-warm-border rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sage-light text-forest rounded">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-charcoal">Air-Gapped Civic Architecture</p>
              <p className="text-[11px] text-charcoal-muted">
                All inference runs on-premise via Docker Desktop Model Runner. Zero telemetry leaves your device.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenStatus}
            className="text-[11px] font-mono text-forest font-semibold hover:underline flex items-center gap-1"
          >
            <HardDrive className="w-3.5 h-3.5" />
            Verify Local Enclave →
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-warm-border/60 pt-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-charcoal">GroundSignal</span>
            <span>—</span>
            <span>Local AI. Real-world impact.</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button onClick={onOpenStatus} className="hover:text-forest transition">
              Local Audit Ledger
            </button>
            <span className="text-warm-border">•</span>
            <button onClick={onOpenStatus} className="hover:text-forest transition">
              Edge Diagnostic
            </button>
            <span className="text-warm-border">•</span>
            <span className="flex items-center gap-1 text-forest">
              <Shield className="w-3 h-3 text-sage" /> Hacktoberfest 2026 Open-Source AI Challenge
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
