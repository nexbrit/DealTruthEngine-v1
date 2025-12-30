'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { evidenceAPI } from '@/lib/api';
import { Evidence } from '@/types';

interface UploadZoneProps {
  dealId: string;
  onUploadComplete: (evidence: Evidence) => void;
}

export function UploadZone({ dealId, onUploadComplete }: UploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const file = acceptedFiles[0];
      const evidence = await evidenceAPI.upload(dealId, file);
      onUploadComplete(evidence);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [dealId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors
        ${isDragActive ? 'border-green-500 bg-green-500/10' : 'border-zinc-600 hover:border-zinc-500'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {uploading ? (
          <Loader2 className="w-10 h-10 text-zinc-400 animate-spin" />
        ) : (
          <div className="p-3 bg-zinc-800 rounded-full">
            <FileSpreadsheet className="w-8 h-8 text-green-500" />
          </div>
        )}
        <div>
          <p className="text-white font-medium">
            {uploading ? 'Uploading...' : isDragActive ? 'Drop file here' : 'Upload Evidence File'}
          </p>
          <p className="text-zinc-400 text-sm mt-1">
            CSV or Excel - CRM pipeline, utilisation, AR ageing
          </p>
        </div>
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}
