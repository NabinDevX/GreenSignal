import React, { useState } from 'react';
import { SavedReport, OBSERVATION_CATEGORIES } from '@groundsignal/shared';
import {
  Search,
  Download,
  FileText,
  Trash2,
  Edit3,
  Calendar,
  MapPin,
  Compass,
  Plus,
  Sparkles,
} from 'lucide-react';
import { exportReportMarkdown, exportReportsJson } from '../utils/export';

interface SavedReportsViewProps {
  reports: SavedReport[];
  onOpenReport: (report: SavedReport) => void;
  onDeleteRequest: (report: SavedReport) => void;
  onCreateNew: () => void;
}

export const SavedReportsView: React.FC<SavedReportsViewProps> = ({
  reports,
  onOpenReport,
  onDeleteRequest,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filteredReports = reports
    .filter((r) => {
      const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.originalObservation.toLowerCase().includes(q) ||
        (r.neighbourhood && r.neighbourhood.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-charcoal-muted uppercase tracking-wider font-semibold">
            LOCAL INDEXED STORAGE · ENCLAVE ARCHIVE
          </span>
          <h1 className="text-3xl font-serif font-bold text-charcoal mt-1">
            Saved Community Reports
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            Stored in the local SQLite archive through the private API. No cloud accounts, fully exportable anytime.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {reports.length > 0 && (
            <button
              onClick={() => exportReportsJson(reports)}
              className="flex items-center gap-1.5 text-xs font-mono border border-warm-border bg-white hover:bg-warm-canvas px-3.5 py-2 rounded text-charcoal transition"
            >
              <Download className="w-3.5 h-3.5 text-forest" />
              <span>Export All ({reports.length} JSON)</span>
            </button>
          )}

          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 text-xs font-medium bg-forest hover:bg-forest-dark text-white px-3.5 py-2 rounded transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Observation</span>
          </button>
        </div>
      </div>

      <div className="bg-warm-panel border border-warm-border rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter saved reports by keyword, street, or category..."
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 bg-white border border-warm-border rounded focus:outline-none focus:ring-1 focus:ring-forest text-charcoal placeholder:text-charcoal-muted/60"
            />
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="text-xs py-2 px-3 bg-white border border-warm-border rounded text-charcoal font-mono"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {['All', ...OBSERVATION_CATEGORIES].map((cat) => {
            const count =
              cat === 'All'
                ? reports.length
                : reports.filter((r) => r.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded transition flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-forest text-white font-medium'
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
          })}
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="bg-warm-panel border border-dashed border-warm-border rounded-lg p-12 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-sage-light text-forest flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-serif font-semibold text-charcoal">
              {reports.length === 0 ? 'No reports saved yet' : 'No matching reports found'}
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              {reports.length === 0
                ? 'Take a walk outside, observe public infrastructure issues, and generate your first report with local AI.'
                : 'Try adjusting your search query or selected category filter.'}
            </p>
          </div>
          {reports.length === 0 && (
            <div>
              <button
                onClick={onCreateNew}
                className="inline-flex items-center gap-1.5 bg-forest hover:bg-forest-dark text-white px-4 py-2 rounded text-xs font-medium transition"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Walk Observation</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-warm-panel border border-warm-border rounded-lg p-5 space-y-4 hover:border-forest/40 transition shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-sage-light text-forest border border-sage-border">
                      {report.category}
                    </span>
                    <span className="font-mono text-[11px] text-charcoal-muted">
                      Ref #{report.id}
                    </span>
                    {report.generatedWithAI && (
                      <span className="flex items-center gap-1 text-[11px] text-sage-dark font-mono">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Draft</span>
                      </span>
                    )}
                    {report.isEdited && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                        User Edited
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-serif font-bold text-charcoal">
                    {report.title}
                  </h3>

                  {report.neighbourhood && (
                    <div className="flex items-center gap-1 text-xs text-charcoal-muted">
                      <MapPin className="w-3.5 h-3.5 text-sage" />
                      <span>{report.neighbourhood}</span>
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0 text-xs text-charcoal-muted font-mono flex items-center sm:block gap-2">
                  <div className="flex items-center gap-1 justify-end">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-[10px]">
                    {new Date(report.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-charcoal">
                <p className="line-clamp-2 leading-relaxed">{report.description}</p>
                <div className="p-2.5 bg-warm-canvas border border-warm-border rounded text-[11px] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-charcoal-muted font-semibold">
                    Constructive Remedy
                  </span>
                  <p className="line-clamp-2 text-charcoal leading-relaxed">
                    {report.suggestedAction}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-warm-border flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => onOpenReport(report)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-dark"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Open & Edit</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportReportMarkdown(report)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white hover:bg-warm-canvas border border-warm-border rounded text-charcoal transition"
                  >
                    <FileText className="w-3 h-3 text-forest" />
                    <span>Markdown</span>
                  </button>

                  <button
                    onClick={() => exportReportsJson(report)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white hover:bg-warm-canvas border border-warm-border rounded text-charcoal transition"
                  >
                    <Download className="w-3 h-3 text-forest" />
                    <span>JSON</span>
                  </button>

                  <button
                    onClick={() => onDeleteRequest(report)}
                    title="Delete Report"
                    className="p-1 text-charcoal-muted hover:text-red-700 hover:bg-red-50 border border-warm-border rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
