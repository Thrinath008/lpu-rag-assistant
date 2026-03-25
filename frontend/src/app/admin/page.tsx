'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUpload } from '@/hooks/useUpload';
import { UploadCloud, CheckCircle, AlertCircle, Loader2, Database } from 'lucide-react';

export default function AdminPage() {
  const { uploadFile, isUploading, lastUploadStatus, error } = useUpload();
  const [chunksCreated, setChunksCreated] = useState<number | undefined>();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.name.endsWith('.docx')) {
      return;
    }

    try {
      const response = await uploadFile(file);
      setChunksCreated(response.chunks_created);
    } catch (err) {
      // Error handled by hook
      setChunksCreated(undefined);
    }
  }, [uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Knowledge Base Administration</h1>
        <p className="text-slate-400">Upload University documents to train the RAG assistant. Only .docx format is supported.</p>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-white mb-4">Document Ingestion Pipeline</h2>
        
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-orange-500 bg-orange-500/10' : 
            isUploading ? 'border-slate-600 bg-slate-800 opacity-50 cursor-not-allowed' :
            'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          {isUploading ? (
            <div className="space-y-3">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
              <p className="text-orange-500 font-medium">Processing document & generating embeddings...</p>
              <p className="text-sm text-slate-400">This may take a minute depending on file size.</p>
            </div>
          ) : isDragActive ? (
            <p className="text-orange-500 font-medium">Drop the .docx file here...</p>
          ) : (
            <div className="space-y-1">
              <p className="text-slate-300"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-sm text-slate-500">.DOCX files only (MAX. 10MB)</p>
            </div>
          )}
        </div>

        {lastUploadStatus && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-green-500 font-medium">Upload & Processing Successful</h3>
              <p className="text-green-400/80 text-sm mt-1">{lastUploadStatus}</p>
              {chunksCreated !== undefined && (
                <p className="text-green-400/80 text-sm font-medium mt-1">
                  Database updated with {chunksCreated} new vector chunks.
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-red-500 font-medium">Ingestion Failed</h3>
              <p className="text-red-400/80 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-white mb-4">Inventory Overview</h2>
        <div className="flex items-center justify-center p-8 bg-slate-900/50 border border-slate-700 rounded-lg">
          <div className="text-center">
            <Database className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">Document inventory list will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
