import React, { useState } from 'react';
import { parseRosterCsv, DatabaseState } from '../data/database';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Layers,
  RefreshCw,
  Info,
} from 'lucide-react';

interface ImportCsvModalProps {
  onClose: () => void;
  onImportSuccess: (newState: DatabaseState) => void;
  currentDb?: DatabaseState;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  onClose,
  onImportSuccess,
  currentDb,
}) => {
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [previewInfo, setPreviewInfo] = useState<{
    employeeCount: number;
    sampleNames: string[];
    dateCount: number;
    dateRangeText: string;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvText(text);
        tryParse(text);
      }
    };
    reader.readAsText(file);
  };

  const tryParse = (text: string) => {
    try {
      setError(null);
      // Fast probe parsing to check header dates
      const parsed = parseRosterCsv(text);
      
      // Check date columns in header
      const lines = text.trim().split(/\r?\n/);
      let detectedDates: string[] = [];
      if (lines.length > 0) {
        const headerCells = lines[0].split(',');
        detectedDates = headerCells.slice(19).map(c => c.replace(/["']/g, '').trim()).filter(Boolean);
      }

      let dateRangeText = 'All 2026 dates';
      if (detectedDates.length > 0) {
        dateRangeText = `${detectedDates[0]} to ${detectedDates[detectedDates.length - 1]} (${detectedDates.length} days)`;
      }

      setPreviewInfo({
        employeeCount: parsed.balances.length,
        sampleNames: parsed.balances.slice(0, 4).map((b) => b.name),
        dateCount: detectedDates.length,
        dateRangeText,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to parse CSV format. Please verify the header and columns.');
      setPreviewInfo(null);
    }
  };

  const handleApply = () => {
    try {
      // If mode is 'merge', pass currentDb to preserve existing records
      const base = importMode === 'merge' ? currentDb : undefined;
      const parsed = parseRosterCsv(csvText, base);
      onImportSuccess(parsed);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to apply CSV to database');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Import &amp; Sync Roster CSV
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a monthly update (e.g., November/December) or a full year roster CSV
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 font-bold text-base"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {/* File Picker */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Upload CSV File
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors bg-slate-50">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csvFileInput"
              />
              <label
                htmlFor="csvFileInput"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Upload className="w-6 h-6 text-blue-600" />
                <span className="font-semibold text-blue-600 hover:underline">
                  Click to select CSV file from your computer
                </span>
                <span className="text-[11px] text-slate-400">
                  Supports full year roster or specific month (November, December, etc.)
                </span>
              </label>
            </div>
          </div>

          {/* Or Paste Area */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Or Paste CSV Raw Text
            </label>
            <textarea
              rows={4}
              placeholder="Paste comma-separated rows here..."
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                if (e.target.value.length > 50) {
                  tryParse(e.target.value);
                }
              }}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Import Mode Selection */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="block font-bold text-slate-800">
              Choose Synchronization Mode:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  importMode === 'merge'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Merge &amp; Update
                    <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Updates November/new dates without erasing prior months (Jan–Oct).
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  importMode === 'overwrite'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  value="overwrite"
                  checked={importMode === 'overwrite'}
                  onChange={() => setImportMode('overwrite')}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                    Full Replace
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Completely replaces database with only the dates in this file.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Info */}
          {previewInfo && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Detected {previewInfo.employeeCount} Resources in CSV</span>
              </div>
              <div className="text-[11px] text-emerald-800 space-y-0.5 pl-6">
                <div>
                  <span className="font-semibold">Date Columns:</span> {previewInfo.dateRangeText}
                </div>
                <div>
                  <span className="font-semibold">Team Members:</span> {previewInfo.sampleNames.join(', ')}...
                </div>
              </div>

              {/* Real-time effect guarantee */}
              <div className="mt-2 pt-2 border-t border-emerald-200/80 flex items-start gap-1.5 text-[11px] text-emerald-900">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Immediate Effect:</strong> Dashboard attendance trends line chart, daily On Duty / On Leave / Week Off counters, and employee leave ledgers will recalculate instantly.
                </span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Changes persist in your local database automatically.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!previewInfo}
                className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:hover:bg-blue-600 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sync &amp; Update Database</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
