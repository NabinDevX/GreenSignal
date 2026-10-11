import React, { useState } from 'react';
import {
  OBSERVATION_CATEGORIES,
  ObservationCategory,
  GenerateReportResponse,
} from '@groundsignal/shared';
import {
  Sparkles,
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  Cpu,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { generateReportApi } from '../services/api';

interface CreateObservationViewProps {
  onBack: () => void;
  onReportGenerated: (
    reportData: GenerateReportResponse['report'],
    metadata: GenerateReportResponse['metadata'],
    originalInput: {
      observation: string;
      category: ObservationCategory;
      neighbourhood?: string;
      notes?: string;
    }
  ) => void;
  onOpenStatus: () => void;
  modelReady: boolean;
  modelId?: string;
}

export const CreateObservationView: React.FC<CreateObservationViewProps> = ({
  onBack,
  onReportGenerated,
  onOpenStatus,
  modelReady,
  modelId,
}) => {
  const [category, setCategory] = useState<ObservationCategory>('Accessibility');
  const [observation, setObservation] = useState('');
  const [neighbourhood, setNeighbourhood] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const steps = [
    'Verifying local Docker Model Runner loopback...',
    'Dispatching prompt to on-device Llama 3.2...',
    'Synthesizing factual municipal description...',
    'Validating structured civic schema...',
  ];

  const handleLoadExample = () => {
    setCategory('Accessibility');
    setObservation(
      'A commercial delivery van is parked over the curb ramp outside the transit hub entrance at 4th Ave & Station Way, completely blocking sidewalk wheelchair access and forcing pedestrians into the active vehicle traffic lane.'
    );
    setNeighbourhood('North Ward / Transit Corridor');
    setNotes('Observed weekday morning at 08:30 AM; recurs frequently during freight deliveries.');
    setError(null);
  };

  const handleClear = () => {
    setObservation('');
    setNeighbourhood('');
    setNotes('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (observation.trim().length < 10) {
      setError('Observation must be at least 10 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    setErrorCode(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1400);

    try {
      const response = await generateReportApi({
        observation: observation.trim(),
        category,
        neighbourhood: neighbourhood.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      clearInterval(stepInterval);
      setLoading(false);

      onReportGenerated(response.report, response.metadata, {
        observation: observation.trim(),
        category,
        neighbourhood: neighbourhood.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setLoading(false);
      const message = err instanceof Error ? err.message : 'Report generation failed.';
      const code = (err as { code?: string })?.code || 'ERROR';
      setError(message);
      setErrorCode(code);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-muted hover:text-charcoal transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-warm-panel border border-warm-border rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted font-semibold">
              FIELD OBSERVATION LOG
            </span>
            <button
              type="button"
              onClick={handleLoadExample}
              className="text-xs font-mono text-forest font-semibold hover:underline"
            >
              Load Example Walk Observation
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">
            Log Public-Space Observation
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
            Record what you noticed on your outdoor walk. Local AI will formulate a constructive draft without sending any data off your computer.
          </p>
        </div>

        {!modelReady && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Docker Model Runner Not Detected</p>
              <p className="text-[11px]">
                To generate live AI drafts, ensure Docker Desktop is open with Model Runner enabled on port 12434 and Llama 3.2 loaded.
              </p>
              <button
                type="button"
                onClick={onOpenStatus}
                className="text-forest font-semibold underline text-[11px]"
              >
                Inspect System Status & Diagnostics →
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
              Observation Category <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OBSERVATION_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 text-xs font-medium rounded border text-left flex items-center justify-between transition ${
                    category === cat
                      ? 'bg-forest text-white border-forest shadow-sm'
                      : 'bg-white border-warm-border text-charcoal hover:bg-warm-canvas'
                  }`}
                >
                  <span>{cat}</span>
                  {category === cat && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="obs-textarea"
                className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                Observation Details <span className="text-red-600">*</span>
              </label>
              <span className="text-[11px] font-mono text-charcoal-muted">
                {observation.length} / 2,000 chars
              </span>
            </div>
            <textarea
              id="obs-textarea"
              rows={4}
              required
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="e.g., A delivery van is parked over the sidewalk curb ramp outside 42 Maple St, forcing people in wheelchairs and strollers into the roadway..."
              className="w-full text-sm p-3 bg-white border border-warm-border rounded focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest text-charcoal placeholder:text-charcoal-muted/60"
            />
            <p className="text-[11px] text-charcoal-muted">
              Guidance: Be factual and objective. Describe what is directly visible without speculation or personal accusations.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="neighbourhood-input"
              className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
            >
              Neighbourhood / Location (Optional)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-sage absolute left-3 top-2.5 pointer-events-none" />
              <input
                id="neighbourhood-input"
                type="text"
                value={neighbourhood}
                onChange={(e) => setNeighbourhood(e.target.value)}
                placeholder="e.g. Elmwood / North Ward"
                className="w-full text-sm pl-9 pr-3 py-2 bg-white border border-warm-border rounded focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest text-charcoal"
              />
            </div>
            <p className="text-[11px] text-charcoal-muted">
              Offline manual entry only. No GPS or location telemetry is collected.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="notes-input"
              className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
            >
              Timing or Recurrence Notes (Optional)
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-sage absolute left-3 top-2.5 pointer-events-none" />
              <input
                id="notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Happens daily during morning delivery peak (08:00 - 09:30 AM)"
                className="w-full text-sm pl-9 pr-3 py-2 bg-white border border-warm-border rounded focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest text-charcoal"
              />
            </div>
          </div>

          <div className="p-3.5 bg-sage-light/50 border border-sage-border rounded flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
            <div className="text-xs text-charcoal space-y-0.5">
              <p className="font-semibold text-forest">Private Local Processing</p>
              <p className="text-[11px] text-charcoal-muted leading-relaxed">
                GroundSignal produces an editable draft for your review. It will never contact authorities, file legal complaints, or track individuals.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-xs text-red-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-700" />
                <span>Generation Error ({errorCode || 'API_ERROR'})</span>
              </div>
              <p>{error}</p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="px-3 py-1 bg-red-700 text-white rounded font-medium text-xs hover:bg-red-800 transition"
                >
                  Retry Inference
                </button>
                <button
                  type="button"
                  onClick={onOpenStatus}
                  className="underline text-red-800 text-xs"
                >
                  Check Model Connection
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="p-5 bg-warm-panel border border-forest/30 rounded-lg space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-forest font-semibold text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Civic Report with On-Device AI...</span>
                </div>
                <span className="font-mono text-xs text-charcoal-muted">
                  Model: {modelId ? modelId.split('/').pop()?.split(':')[0] : 'Llama 3.2'}
                </span>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="w-full bg-warm-border h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-forest h-full transition-all duration-500"
                    style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs font-mono text-charcoal-muted">
                  {steps[loadingStep]}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-warm-border">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="text-xs text-charcoal-muted hover:text-charcoal transition"
            >
              Clear Form
            </button>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || observation.trim().length < 10}
                className="flex items-center gap-2 bg-forest hover:bg-forest-dark disabled:opacity-50 text-white px-5 py-2.5 rounded font-medium text-sm transition shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-sage-light" />
                    <span>Generate Civic Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
