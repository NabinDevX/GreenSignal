import React, { useState, useEffect } from 'react';
import {
  SavedReport,
  ObservationCategory,
  GenerateReportResponse,
} from '@groundsignal/shared';
import { Header, ActiveTab } from './components/Header';
import { Footer } from './components/Footer';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { DashboardView } from './views/DashboardView';
import { CreateObservationView } from './views/CreateObservationView';
import { ReportReviewView } from './views/ReportReviewView';
import { SavedReportsView } from './views/SavedReportsView';
import { SystemStatusView } from './views/SystemStatusView';
import {
  fetchHealth,
  fetchSavedReports,
  saveReportApi,
  deleteReportApi,
} from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [activeDraft, setActiveDraft] = useState<SavedReport | null>(null);
  const [reportToDelete, setReportToDelete] = useState<SavedReport | null>(null);

  const [modelReady, setModelReady] = useState(false);
  const [modelId, setModelId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchSavedReports()
      .then(setReports)
      .catch((error: unknown) => console.error('Failed to load saved reports', error));
  }, []);

  const checkHealth = async () => {
    try {
      const data = await fetchHealth();
      const isAvailable = data.modelRunner.status === 'connected';
      setModelReady(isAvailable);
      setModelId(data.modelRunner.modelId);
    } catch {
      setModelReady(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleReportGenerated = (
    reportData: GenerateReportResponse['report'],
    metadata: GenerateReportResponse['metadata'],
    input: {
      observation: string;
      category: ObservationCategory;
      neighbourhood?: string;
      notes?: string;
    }
  ) => {
    const newReport: SavedReport = {
      id: `rep-${Date.now().toString(36)}`,
      title: reportData.title,
      category: reportData.category,
      originalObservation: input.observation,
      description: reportData.description,
      potentialImpact: reportData.potentialImpact,
      suggestedAction: reportData.suggestedAction,
      neighbourhood: input.neighbourhood,
      notes: input.notes,
      createdAt: metadata.timestamp,
      updatedAt: metadata.timestamp,
      generatedWithAI: true,
      modelId: metadata.modelId,
      isEdited: false,
    };

    setActiveDraft(newReport);
    setActiveTab('review');
  };

  const handleSaveReport = async (report: SavedReport) => {
    const saved = await saveReportApi(report);
    setReports((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
    setActiveDraft(saved);
  };

  const handleOpenReport = (report: SavedReport) => {
    setActiveDraft(report);
    setActiveTab('review');
  };

  const handleDeleteConfirm = async (id: string) => {
    await deleteReportApi(id);
    setReports((current) => current.filter((report) => report.id !== id));
    if (activeDraft?.id === id) {
      setActiveDraft(null);
      setActiveTab('saved');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-canvas text-charcoal">
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedCount={reports.length}
        modelReady={modelReady}
        modelId={modelId}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            reports={reports}
            onCreateClick={() => setActiveTab('create')}
            onViewSavedClick={() => setActiveTab('saved')}
            onOpenReport={handleOpenReport}
            modelReady={modelReady}
            modelId={modelId}
          />
        )}

        {activeTab === 'create' && (
          <CreateObservationView
            onBack={() => setActiveTab('dashboard')}
            onReportGenerated={handleReportGenerated}
            onOpenStatus={() => setActiveTab('status')}
            modelReady={modelReady}
            modelId={modelId}
          />
        )}

        {activeTab === 'review' && activeDraft && (
          <ReportReviewView
            initialReport={activeDraft}
            onBack={() => setActiveTab('saved')}
            onSaveReport={handleSaveReport}
            onRegenerate={() => setActiveTab('create')}
            onDiscard={() => {
              setActiveDraft(null);
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'saved' && (
          <SavedReportsView
            reports={reports}
            onOpenReport={handleOpenReport}
            onDeleteRequest={(rep) => setReportToDelete(rep)}
            onCreateNew={() => setActiveTab('create')}
          />
        )}

        {activeTab === 'status' && (
          <SystemStatusView onRefreshHealth={checkHealth} />
        )}
      </main>

      <Footer onOpenStatus={() => setActiveTab('status')} />

      <DeleteConfirmModal
        report={reportToDelete}
        isOpen={reportToDelete !== null}
        onClose={() => setReportToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default App;
