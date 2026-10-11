import React, { useState } from 'react';
import {
  SavedReport,
  ObservationCategory,
  OBSERVATION_CATEGORIES,
} from '@groundsignal/shared';
import {
  ArrowLeft,
  Check,
  Download,
  FileText,
  FileCode,
  Copy,
  RotateCcw,
  Trash2,
  Sparkles,
  ShieldAlert,
  Save,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  exportReportMarkdown,
  exportReportsJson,
  formatReportAsMarkdown,
  copyToClipboard,
} from '../utils/export';

interface ReportReviewViewProps {
  initialReport: SavedReport;
  onBack: () => void;
  onSaveReport: (report: SavedReport) => Promise<void>;
  onRegenerate: () => void;
  onDiscard: () => void;
}

export const ReportReviewView: React.FC<ReportReviewViewProps> = ({
  initialReport,
  onBack,
  onSaveReport,
  onRegenerate,
  onDiscard,
}) => {
  const [title, setTitle] = useState(initialReport.title);
  const [category, setCategory] = useState<ObservationCategory>(initialReport.category);
  const [description, setDescription] = useState(initialReport.description);
  const [potentialImpact, setPotentialImpact] = useState(initialReport.potentialImpact);
  const [suggestedAction, setSuggestedAction] = useState(initialReport.suggestedAction);
  const [neighbourhood, setNeighbourhood] = useState(initialReport.neighbourhood || '');
  const [notes, setNotes] = useState(initialReport.notes || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const getCurrentReportObject = (): SavedReport => ({
    ...initialReport,
    title: title.trim() || initialReport.title,
    category,
    description: description.trim() || initialReport.description,
    potentialImpact: potentialImpact.trim() || initialReport.potentialImpact,
    suggestedAction: suggestedAction.trim() || initialReport.suggestedAction,
    neighbourhood: neighbourhood.trim() || undefined,
    notes: notes.trim() || undefined,
    isEdited: true,
    updatedAt: new Date().toISOString(),
  });

  const handleSave = async () => {
    try {
      setSaveError(null);
      await onSaveReport(getCurrentReportObject());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : 'Could not save report.');
    }
  };

  const handleCopyMarkdown = async () => {
    const md = formatReportAsMarkdown(getCurrentReportObject());
    const ok = await copyToClipboard(md);
    if (ok) {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-muted hover:text-charcoal transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {initialReport.generatedWithAI && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-sage-light text-forest border border-sage-border">
              <Sparkles className="w-3 h-3 text-sage" />
              <span>Generated with Local AI ({initialReport.modelId ? initialReport.modelId.split('/').pop()?.split(':')[0] : 'Llama 3.2'})</span>
            </span>
          )}
        </div>
        {saveError && <p className="text-xs text-red-700">{saveError}</p>}
      </div>

      <div className="p-3.5 bg-[#F4F6F3] border border-sage-border rounded-lg flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-charcoal">
          <p className="font-semibold text-forest">Review and Edit Before Sharing</p>
          <p className="text-charcoal-muted text-[11px] leading-relaxed">
            This report is an unsubmitted draft generated on your device. GroundSignal does not send notices to authorities, file official complaints, or verify legal violations. Please review all fields for accuracy.
          </p>
        </div>
      </div>

      <div className="bg-warm-panel border border-warm-border rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-warm-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono text-charcoal-muted uppercase tracking-wider font-semibold">
              COMMUNITY REPORT DRAFT · {initialReport.id}
            </span>
            <h1 className="text-2xl font-serif font-bold text-charcoal mt-1">
              Review & Refine Draft
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium transition shadow-sm ${
                savedSuccess
                  ? 'bg-emerald-700 text-white'
                  : 'bg-forest hover:bg-forest-dark text-white'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved to Browser!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
              Report Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base sm:text-lg font-serif font-medium px-3 py-2 bg-white border border-warm-border rounded focus:outline-none focus:ring-1 focus:ring-forest text-charcoal"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {OBSERVATION_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded border transition ${
                    category === cat
                      ? 'bg-forest text-white border-forest font-medium'
                      : 'bg-white border-warm-border text-charcoal hover:bg-warm-canvas'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-warm-canvas border border-warm-border rounded text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-charcoal-muted">
              <span>ORIGINAL WALK OBSERVATION (VERBATIM)</span>
              <span>Input from outdoors</span>
            </div>
            <p className="italic text-charcoal font-sans text-xs sm:text-sm">
              "{initialReport.originalObservation}"
            </p>
            {initialReport.notes && (
              <p className="text-[11px] text-charcoal-muted">
                <strong>Context:</strong> {initialReport.notes}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
              Factual Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm p-3 bg-white border border-warm-border rounded focus:outline-none focus:ring-1 focus:ring-forest text-charcoal"
            />
            <p className="text-[11px] text-charcoal-muted">
              AI-structured neutral statement of observed conditions.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
              Potential Impact Assessment
            </label>
            <textarea
              rows={3}
              value={potentialImpact}
              onChange={(e) => setPotentialImpact(e.target.value)}
              className="w-full text-sm p-3 bg-white border border-warm-border rounded focus:outline-none focus:ring-1 focus:ring-forest text-charcoal"
            />
            <p className="text-[11px] text-charcoal-muted">
              Practical consequences for pedestrians, seniors, children, or wheelchair accessibility.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
              Suggested Community Remedy / Action
            </label>
            <textarea
              rows={3}
              value={suggestedAction}
              onChange={(e) => setSuggestedAction(e.target.value)}
              className="w-full text-sm p-3 bg-white border border-warm-border rounded focus:outline-none focus:ring-1 focus:ring-forest text-charcoal"
            />
            <p className="text-[11px] text-charcoal-muted">
              Constructive suggestion for municipal maintenance, traffic monitoring, or neighborhood repair.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
              Neighbourhood / Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-sage absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={neighbourhood}
                onChange={(e) => setNeighbourhood(e.target.value)}
                placeholder="e.g. Elmwood / North Ward"
                className="w-full text-sm pl-9 pr-3 py-2 bg-white border border-warm-border rounded focus:outline-none focus:ring-1 focus:ring-forest text-charcoal"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-warm-border space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => exportReportMarkdown(getCurrentReportObject())}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white hover:bg-warm-canvas border border-warm-border rounded text-charcoal transition"
              >
                <FileText className="w-3.5 h-3.5 text-forest" />
                <span>Export Markdown (.md)</span>
              </button>

              <button
                onClick={() => exportReportsJson(getCurrentReportObject())}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white hover:bg-warm-canvas border border-warm-border rounded text-charcoal transition"
              >
                <Download className="w-3.5 h-3.5 text-forest" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white hover:bg-warm-canvas border border-warm-border rounded text-charcoal transition"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-charcoal-muted" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 text-xs text-forest hover:text-forest-dark px-2 py-1 font-medium transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>

              <button
                onClick={onDiscard}
                className="flex items-center gap-1.5 text-xs text-red-700 hover:text-red-900 px-2 py-1 font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Discard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
