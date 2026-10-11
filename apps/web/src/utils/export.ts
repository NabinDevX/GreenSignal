import { SavedReport } from '@groundsignal/shared';

export function formatReportAsMarkdown(report: SavedReport): string {
  const dateFormatted = new Date(report.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `# ${report.title}

> **Category:** ${report.category}  
> **Date Noted:** ${dateFormatted}  
${report.neighbourhood ? `> **Location:** ${report.neighbourhood}  \n` : ''}> **Inference:** ${report.generatedWithAI ? `Local AI (${report.modelId || 'On-Device'})` : 'User Observation'}  
> **Status:** Community Draft (Unsubmitted)

---

## 1. Original Observation
> "${report.originalObservation}"
${report.notes ? `\n*Additional Context:* ${report.notes}` : ''}

## 2. Factual Description
${report.description}

## 3. Potential Community & Safety Impact
${report.potentialImpact}

## 4. Suggested Action & Remedy
${report.suggestedAction}

---
*Notice: Generated as a constructive community advocacy draft with GroundSignal. No official claim or legal submission has been made.*
`;
}

export function downloadFile(filename: string, content: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportReportMarkdown(report: SavedReport): void {
  const md = formatReportAsMarkdown(report);
  const slug = report.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  downloadFile(`groundsignal-report-${slug || report.id}.md`, md, 'text/markdown;charset=utf-8');
}

export function exportReportsJson(reports: SavedReport | SavedReport[]): void {
  const jsonContent = JSON.stringify(reports, null, 2);
  const isArray = Array.isArray(reports);
  const filename = isArray
    ? `groundsignal-saved-reports-${new Date().toISOString().slice(0, 10)}.json`
    : `groundsignal-report-${(reports as SavedReport).id}.json`;
  downloadFile(filename, jsonContent, 'application/json;charset=utf-8');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
