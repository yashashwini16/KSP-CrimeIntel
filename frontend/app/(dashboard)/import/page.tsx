"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface PreviewData {
  headers: string[];
  preview: Record<string, any>[];
  total_rows: number;
}

interface ImportResult {
  imported: number;
  skipped: number;
  total_rows: number;
  errors: string[];
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setResult(null);
    setError(null);
    setLoadingPreview(true);

    const formData = new FormData();
    formData.append("file", selected);

    try {
      const res = await api.post<PreviewData>("/api/import/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to parse file preview.");
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post<ImportResult>("/api/import/cases", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Import process failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Legacy Data Ingestion
        </h1>
        <p className="text-sm text-muted-foreground">
          Import legacy FIR records, incident sheets, and historical crime data from Excel (.xlsx) or CSV files into the KSP CrimeIntel database.
        </p>
      </div>

      {/* File Upload Dropzone */}
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer text-sm font-semibold text-primary hover:underline">
            Choose Excel or CSV file
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".csv, .xlsx, .xls"
            className="sr-only"
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Supports CSV, XLSX up to 5,000 records per batch
          </p>
        </div>
        {file && (
          <p className="mt-3 text-sm font-medium text-foreground">
            Selected: <span className="text-ksp-saffron">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loadingPreview && (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Parsing file data...</span>
        </div>
      )}

      {/* Preview Table */}
      {preview && !result && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Data Preview</h3>
              <p className="text-xs text-muted-foreground">
                Showing first 5 rows out of {preview.total_rows} detected records
              </p>
            </div>
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 rounded-lg bg-ksp-navy px-4 py-2 text-sm font-semibold text-ksp-saffron hover:bg-ksp-navy/90 disabled:opacity-50"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Importing Records...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Start Bulk Import</span>
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  {preview.headers.map((h) => (
                    <th key={h} className="px-3 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {preview.preview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/30">
                    {preview.headers.map((h) => (
                      <td key={h} className="px-3 py-2 text-foreground">
                        {String(row[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Result summary */}
      {result && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 space-y-3">
          <div className="flex items-center gap-3 text-green-400">
            <CheckCircle2 className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Import Complete!</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm text-foreground">
            <div className="rounded-lg bg-background/50 p-3">
              <span className="text-xs text-muted-foreground">Successfully Imported</span>
              <p className="text-xl font-bold text-green-400">{result.imported}</p>
            </div>
            <div className="rounded-lg bg-background/50 p-3">
              <span className="text-xs text-muted-foreground">Skipped / Failed</span>
              <p className="text-xl font-bold text-amber-400">{result.skipped}</p>
            </div>
            <div className="rounded-lg bg-background/50 p-3">
              <span className="text-xs text-muted-foreground">Total Batch Size</span>
              <p className="text-xl font-bold text-foreground">{result.total_rows}</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-destructive mb-1">Errors Encountered:</p>
              <ul className="list-disc pl-4 space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
