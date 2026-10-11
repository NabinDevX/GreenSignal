import React, { useState, useEffect } from 'react';
import { ModelPingResponse, ModelStatusResponse } from '@groundsignal/shared';
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  HardDrive,
  Lock,
} from 'lucide-react';
import { fetchModelStatus, pingModel } from '../services/api';

interface SystemStatusViewProps {
  onRefreshHealth: () => void;
}

export const SystemStatusView: React.FC<SystemStatusViewProps> = ({ onRefreshHealth }) => {
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState<ModelStatusResponse | null>(null);

  const [pingRunning, setPingRunning] = useState(false);
  const [pingResult, setPingResult] = useState<ModelPingResponse | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchModelStatus();
      setStatusData(data);
      onRefreshHealth();
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleRunPing = async () => {
    setPingRunning(true);
    try {
      const res = await pingModel();
      setPingResult(res);
    } catch (err: unknown) {
      setPingResult({
        success: false,
        latencyMs: 0,
        error: err instanceof Error ? err.message : 'Ping execution failed',
      });
    } finally {
      setPingRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-charcoal-muted uppercase tracking-wider font-semibold">
            SYSTEM INTEGRITY · ENCLAVE AUDIT
          </span>
          <h1 className="text-3xl font-serif font-bold text-charcoal mt-1">
            Local AI Diagnostics & Verification
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            GroundSignal communicates strictly via loopback to your machine's Docker Model Runner.
          </p>
        </div>

        <button
          onClick={loadStatus}
          disabled={loading}
          className="flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-2 text-xs font-mono bg-white hover:bg-warm-canvas border border-warm-border rounded text-charcoal transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-forest ${loading ? 'animate-spin' : ''}`} />
          <span>Re-check Connection</span>
        </button>
      </div>

      <div className="bg-warm-panel border border-warm-border rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-border">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                statusData?.available
                  ? 'bg-emerald-600 animate-pulse'
                  : 'bg-amber-500'
              }`}
            />
            <div>
              <h2 className="text-lg font-serif font-bold text-charcoal">
                {statusData?.available ? 'Model Runner Connected & Ready' : 'Model Runner Unreachable'}
              </h2>
              <p className="text-xs text-charcoal-muted font-mono">
                TCP Loopback Endpoint: {statusData?.configuredEndpoint || 'http://localhost:12434/engines/v1'}
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-mono font-medium px-3 py-1 rounded-full border self-start sm:self-auto ${
              statusData?.available
                ? 'bg-sage-light text-forest border-sage-border'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {statusData?.available ? 'LIVE INFERENCE VERIFIED' : 'ACTION REQUIRED'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-warm-canvas border border-warm-border rounded space-y-1">
            <span className="text-[10px] font-mono uppercase text-charcoal-muted font-semibold">
              RUNTIME ENGINE
            </span>
            <p className="font-semibold text-charcoal">Docker Desktop Model Runner</p>
            <p className="text-[11px] text-charcoal-muted">OpenAI-compatible local inference API</p>
          </div>

          <div className="p-3.5 bg-warm-canvas border border-warm-border rounded space-y-1">
            <span className="text-[10px] font-mono uppercase text-charcoal-muted font-semibold">
              VERIFIED ACTIVE MODEL
            </span>
            <p className="font-mono text-forest font-semibold truncate">
              {statusData?.modelId || 'None detected'}
            </p>
            <p className="text-[11px] text-charcoal-muted">
              {statusData?.availableModels?.length || 0} model(s) returned by runner
            </p>
          </div>

          <div className="p-3.5 bg-warm-canvas border border-warm-border rounded space-y-1">
            <span className="text-[10px] font-mono uppercase text-charcoal-muted font-semibold">
              REQUEST TIMEOUT
            </span>
            <p className="font-mono text-charcoal font-semibold">
              {statusData?.timeoutMs ? `${statusData.timeoutMs / 1000} seconds` : '60 seconds'}
            </p>
            <p className="text-[11px] text-charcoal-muted">Ensures resilient abort handling on CPU</p>
          </div>

          <div className="p-3.5 bg-warm-canvas border border-warm-border rounded space-y-1">
            <span className="text-[10px] font-mono uppercase text-charcoal-muted font-semibold">
              ISOLATION BOUNDARY
            </span>
            <p className="font-mono text-forest font-semibold">0 WAN Sockets (Air-Gapped)</p>
            <p className="text-[11px] text-charcoal-muted">Zero credentials, no cloud API calls</p>
          </div>
        </div>

        {statusData && !statusData.available && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Diagnostic Information</span>
            </div>
            <p>{statusData.error}</p>
            <div className="pt-1 text-[11px] font-mono text-amber-800">
              Ensure Docker Desktop is open with Model Runner TCP port enabled on 12434 and Llama 3.2 installed.
            </div>
          </div>
        )}
      </div>

      <div className="bg-warm-panel border border-warm-border rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-forest" />
            <h2 className="text-lg font-serif font-bold text-charcoal">
              Local Model Ping Benchmark
            </h2>
          </div>
          <button
            onClick={handleRunPing}
            disabled={pingRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-forest hover:bg-forest-dark text-white rounded transition disabled:opacity-50"
          >
            {pingRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Pinging...</span>
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5" />
                <span>Run Ping Test</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-charcoal-muted">
          Sends a 1-token diagnostic completion to measure host-to-runner loopback latency.
        </p>

        {pingResult && (
          <div
            className={`p-3.5 rounded border text-xs font-mono space-y-1.5 ${
              pingResult.success
                ? 'bg-[#F4F6F3] border-sage-border text-charcoal'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                Status: {pingResult.success ? '200 OK (Verified)' : 'Ping Failed'}
              </span>
              <span>Roundtrip: {pingResult.latencyMs} ms</span>
            </div>
            {pingResult.reply && (
              <p className="text-[11px] text-charcoal-muted">
                Model response: "{pingResult.reply}"
              </p>
            )}
            {pingResult.error && <p className="text-[11px] text-red-700">{pingResult.error}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-warm-panel border border-warm-border rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2 text-forest">
            <Layers className="w-4 h-4" />
            <h3 className="font-serif font-bold text-base text-charcoal">
              Two-Layer Proxy Topology
            </h3>
          </div>
          <div className="p-3 bg-warm-canvas border border-warm-border rounded font-mono text-[11px] text-charcoal-muted space-y-1 leading-relaxed">
            <p>1. Browser UI → relative /api/...</p>
            <p>2. Vite Dev Proxy (5173) → Express API (3001)</p>
            <p>3. Express Server → Docker Model Runner (12434)</p>
            <p>4. Docker Runner → Llama 3.2 local weights</p>
          </div>
          <p className="text-[11px] text-charcoal-muted">
            The browser never exposes Docker endpoints or makes direct cross-origin calls.
          </p>
        </div>

        <div className="bg-warm-panel border border-warm-border rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2 text-forest">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="font-serif font-bold text-base text-charcoal">
              Strict Civic Privacy Guarantees
            </h3>
          </div>
          <ul className="text-xs text-charcoal-muted space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-forest mt-1.5 flex-shrink-0" />
              <span>Zero telemetry, analytics, or user identifiers sent over the internet.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-forest mt-1.5 flex-shrink-0" />
              <span>Saved reports remain in the local SQLite archive on this machine.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-forest mt-1.5 flex-shrink-0" />
              <span>No automated submissions to councils; you maintain full control of exports.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-warm-panel border border-warm-border rounded-lg p-5 space-y-3 text-xs">
        <h3 className="font-serif font-bold text-base text-charcoal">
          Troubleshooting Local Model Runner
        </h3>
        <ol className="list-decimal list-inside space-y-1.5 text-charcoal-muted">
          <li>
            <strong>Check Docker Desktop:</strong> Verify Docker Desktop is running and the Models feature is enabled.
          </li>
          <li>
            <strong>Confirm Model Pull:</strong> Ensure <code className="bg-warm-canvas px-1.5 py-0.5 rounded border border-warm-border text-forest">llama3.2</code> is installed in Docker Desktop → Models.
          </li>
          <li>
            <strong>Verify Port 12434:</strong> Test the endpoint in terminal with <code className="bg-warm-canvas px-1.5 py-0.5 rounded border border-warm-border">curl http://localhost:12434/engines/v1/models</code>.
          </li>
        </ol>
      </div>
    </div>
  );
};
