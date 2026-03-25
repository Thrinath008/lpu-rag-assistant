import { useState, useCallback } from 'react';
import { adminApi } from '../lib/api';
import { toast } from 'sonner';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [lastUploadStatus, setLastUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setLastUploadStatus(null);
    setError(null);

    const toastId = toast.loading(`Uploading ${file.name}...`);

    try {
      const response = await adminApi.uploadDocument(file);
      setLastUploadStatus(response.message);
      toast.success("Document uploaded successfully!", { id: toastId });
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Failed to upload document.";
      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadFile,
    isUploading,
    lastUploadStatus,
    error,
  };
};
