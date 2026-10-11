import React, { useState } from 'react';
import { SavedReport, ObservationCategory } from '@groundsignal/shared';
import {
  Compass,
  FileText,
  Share2,
  Plus,
  ArrowRight,
  Download,
  FileCode,
  MapPin,
  Calendar,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import { exportReportMarkdown, exportReportsJson } from '../utils/export';

interface DashboardViewProps {
  reports: SavedReport[];
  onCreateClick: () => void;
  onViewSavedClick: () => void;
  onOpenReport: (report: SavedReport) => void;
  modelReady: boolean;
  modelId?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reports,
  onCreateClick,
  onViewSavedClick,
  onOpenReport,
  modelReady,
  modelId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredReports = reports.filter((r) => {
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesQuery =
      searchFilter === '' ||
      r.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (r.neighbourhood && r.neighbourhood.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-12">
      <section className="bg-warm-panel border border-warm-border rounded-lg p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-sage-light/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sage-light border border-sage-border text-xs font-mono text-forest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>ON-DEVICE CIVIC INTELLIGENCE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-charcoal leading-tight">
            Turn your daily walk into community action
          </h1>

          <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed">
            Document public-space obstacles, broken footpaths, and accessibility barriers with private, locally running AI.
            Zero accounts, zero tracking, complete hardware-isolated privacy.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onCreateClick}
              className="flex items-center gap-2 bg-forest hover:bg-forest-dark text-white px-5 py-2.5 rounded font-medium text-sm transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create an observation</span>
            </button>
            <button
              onClick={onViewSavedClick}
              className="flex items-center gap-2 bg-white hover:bg-warm-canvas text-charcoal border border-warm-border px-5 py-2.5 rounded font-medium text-sm transition"
            >
              <FileText className="w-4 h-4 text-forest" />
              <span>View saved reports ({reports.length})</span>
            </button>
          </div>

          <div className="pt-4 border-t border-warm-border/60 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-charcoal-muted font-mono">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sage" /> Zero telemetry
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sage" /> Offline capable
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-sage" /> Local Markdown/JSON export
            </span>
            <span>•</span>
            <span className="text-forest font-semibold">
              Engine: {modelReady ? (modelId ? modelId.split('/').pop()?.split(':')[0] : 'Llama 3.2') : 'Local Runner'}
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-medium text-charcoal">
            How GroundSignal works
          </h2>
          <p className="text-sm text-charcoal-muted mt-1">
            From an outdoor neighborhood stroll to structured municipal draft in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-warm-panel border border-warm-border rounded-lg p-6 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-sage-light text-forest border border-sage-border">
                STEP 01
              </span>
              <div className="p-2 rounded bg-sage-light/60 text-forest">
                <Compass className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-serif font-semibold text-charcoal">
              1. Notice Outdoors
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Spot a blocked curb ramp, heaved sidewalk, overflowing bin, or missing shade tree during your walk. Note down brief, honest bullet points.
            </p>
          </div>

          <div className="bg-warm-panel border border-warm-border rounded-lg p-6 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-sage-light text-forest border border-sage-border">
                STEP 02
              </span>
              <div className="p-2 rounded bg-sage-light/60 text-forest">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-serif font-semibold text-charcoal">
              2. Draft with Local AI
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Your local Docker-hosted Llama 3.2 model structures your note into an objective, constructive community report without any cloud API or surveillance.
            </p>
          </div>

          <div className="bg-warm-panel border border-warm-border rounded-lg p-6 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-sage-light text-forest border border-sage-border">
                STEP 03
              </span>
              <div className="p-2 rounded bg-sage-light/60 text-forest">
                <Share2 className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-serif font-semibold text-charcoal">
              3. Review & Share
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Review, edit the draft, and export pristine Markdown or JSON to share with local neighborhood associations, ward councillors, or community groups.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-serif font-medium text-charcoal">
                Recent Observations & Reports
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-sage-light text-forest border border-sage-border">
                {reports.length} stored locally
              </span>
            </div>
            <p className="text-xs text-charcoal-muted mt-1">
              Stored in the local SQLite archive. Never transmitted to third-party databases.
            </p>
          </div>

          {reports.length > 0 && (
            <button
              onClick={() => exportReportsJson(reports)}
              className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-mono border border-warm-border bg-white hover:bg-warm-canvas px-3 py-1.5 rounded text-charcoal transition"
            >
              <Download className="w-3.5 h-3.5 text-forest" />
              <span>Export All ({reports.length} JSON)</span>
            </button>
          )}
        </div>

        {reports.length === 0 ? (
          <div className="bg-warm-panel border border-dashed border-warm-border rounded-lg p-10 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-sage-light text-forest flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-serif font-semibold text-charcoal">
                No observations logged yet
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Take a short stroll outside, notice a public-space improvement area (like a blocked curb ramp or uneven footpath), and log your first observation.
              </p>
            </div>
            <div>
              <button
                onClick={onCreateClick}
                className="inline-flex items-center gap-2 bg-forest hover:bg-forest-dark text-white px-4 py-2 rounded text-sm font-medium transition"
              >
                <Plus className="w-4 h-4" />
                <span>Start First Observation</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {['All', 'Accessibility', 'Footpath', 'Litter', 'Public Safety', 'Green Space', 'Other'].map(
                (cat) => {
                  const count =
                    cat === 'All'
                      ? reports.length
                      : reports.filter((r) => r.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded text-xs transition font-medium flex items-center gap-1.5 ${
                        selectedCategory === cat
                          ? 'bg-forest text-white'
                          : 'bg-white border border-warm-border text-charcoal hover:bg-warm-canvas'
                      }`}
                    >
                      <span>{cat}</span>
                      <span
                        className={`text-[10px] px-1 rounded-full ${
                          selectedCategory === cat
                            ? 'bg-forest-dark text-white'
                            : 'bg-warm-canvas text-charcoal-muted'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-warm-panel border border-warm-border rounded-lg p-5 space-y-4 hover:border-forest/40 transition shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded bg-sage-light text-forest border border-sage-border">
                        {report.category}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-charcoal-muted font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-serif font-bold text-charcoal line-clamp-1">
                      {report.title}
                    </h3>

                    {report.neighbourhood && (
                      <div className="flex items-center gap-1 text-xs text-charcoal-muted">
                        <MapPin className="w-3.5 h-3.5 text-sage flex-shrink-0" />
                        <span className="truncate">{report.neighbourhood}</span>
                      </div>
                    )}

                    <p className="text-xs text-charcoal-muted line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>

                    <div className="p-2.5 bg-[#F8FAF7] border border-warm-border rounded text-xs text-charcoal space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-charcoal-muted font-semibold">
                        Impact & Suggested Action
                      </span>
                      <p className="line-clamp-2 text-charcoal text-[11px] leading-relaxed">
                        {report.suggestedAction}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-warm-border flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenReport(report)}
                      className="text-xs font-semibold text-forest hover:text-forest-dark flex items-center gap-1"
                    >
                      <span>Open & Edit Draft</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportReportMarkdown(report)}
                        title="Download Markdown"
                        className="p-1.5 text-charcoal-muted hover:text-charcoal hover:bg-warm-canvas border border-warm-border rounded"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => exportReportsJson(report)}
                        title="Download JSON"
                        className="p-1.5 text-charcoal-muted hover:text-charcoal hover:bg-warm-canvas border border-warm-border rounded"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
