import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPhotos, updatePhotoMetadata } from '../features/photos/services/photoService';
import type { Photo } from '../features/photos/services/photoService';

export type { Photo };

export function usePhotos() {
  return useQuery({
    queryKey: ['photos'],
    queryFn: () => fetchPhotos(),
  });
}

export function useUpdatePhoto() {
  const queryClient = useQueryClient();

  return {
    updatePhoto: async (id: string, updates: { city?: string | null; topic?: string | null }) => {
      await updatePhotoMetadata(id, updates);
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  };
}
