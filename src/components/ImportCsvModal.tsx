import React, { useState } from 'react';
import { parseRosterCsv, DatabaseState } from '../data/database';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportCsvModalProps {
  onClose: () => void;
  onImportSuccess: (newState: DatabaseState) => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  onClose,
  onImportSuccess,
}) => {
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewInfo, setPreviewInfo] = useState<{
    employeeCount: number;
    sampleNames: string[];
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
      const parsed = parseRosterCsv(text);
      setPreviewInfo({
        employeeCount: parsed.balances.length,
        sampleNames: parsed.balances.slice(0, 5).map((b) => b.name),
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to parse CSV format');
      setPreviewInfo(null);
    }
  };

  const handleApply = () => {
    try {
      const parsed = parseRosterCsv(csvText);
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
              Import &amp; Sync Master Roster CSV
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Load an updated CSV file directly into your local roster database
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 font-bold"
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
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors bg-slate-50">
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
                <Upload className="w-6 h-6 text-indigo-600" />
                <span className="font-semibold text-indigo-600 hover:underline">
                  Click to select CSV file from computer
                </span>
                <span className="text-[11px] text-slate-400">
                  Matches Kaseya NOC 2026 sheet format
                </span>
              </label>
            </div>
          </div>

          {/* Or Paste Area */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Or Paste CSV Raw Content
            </label>
            <textarea
              rows={5}
              placeholder="Paste comma-separated rows here..."
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                if (e.target.value.length > 50) {
                  tryParse(e.target.value);
                }
              }}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            />
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
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Detected {previewInfo.employeeCount} Resources in CSV!</span>
              </div>
              <div className="text-[11px] text-emerald-700">
                Sample: {previewInfo.sampleNames.join(', ')}...
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!previewInfo}
              className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 rounded-lg shadow-sm transition-colors"
            >
              Sync &amp; Update Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
