import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { SavedReport } from '@groundsignal/shared';

interface DeleteConfirmModalProps {
  report: SavedReport | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  report,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-warm-panel border border-warm-border rounded-lg max-w-md w-full p-6 shadow-xl relative animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-charcoal-muted hover:text-charcoal p-1"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-red-100 text-red-700 rounded-full flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif text-charcoal">
              Delete Report?
            </h3>
            <p className="text-xs text-charcoal-muted font-mono mt-0.5">
              Ref #{report.id}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-sm text-charcoal">
          <p>
            Are you sure you want to remove{' '}
            <strong className="font-semibold text-charcoal">"{report.title}"</strong>{' '}
            from the local report archive?
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 font-mono">
            <strong>Local Enclave Notice:</strong> No cloud backup exists because GroundSignal operates 100% on-device. This local record cannot be recovered once purged.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-warm-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-charcoal bg-white border border-warm-border rounded hover:bg-warm-canvas transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(report.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded transition shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
