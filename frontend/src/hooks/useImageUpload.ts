import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useState } from 'react';
import { uploadImage } from '@/services/imagesService';
import type { UploadImageResponse } from '@/types/image';

interface UseImageUploadResult {
  mutation: UseMutationResult<UploadImageResponse, Error, File>;
  progress: number;
}

export function useImageUpload(): UseImageUploadResult {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<UploadImageResponse, Error, File>({
    mutationFn: (file: File) => {
      setProgress(0);
      return uploadImage(file, setProgress);
    },
  });

  return { mutation, progress };
}
