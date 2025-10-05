import { useState, useEffect } from 'react';
import { fetchWasteContainers } from '../lib/payload';
import type { WasteContainer } from '../types/wasteContainer';

interface UseWasteContainersOptions {
  status?: 'active' | 'full' | 'maintenance' | 'inactive';
  wasteType?: string;
}

export function useWasteContainers(options?: UseWasteContainersOptions) {
  const [containers, setContainers] = useState<WasteContainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContainers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWasteContainers({
        ...options,
        limit: 100, // Load all containers for map display
      });
      setContainers(response.docs);
    } catch (err) {
      console.error('Error loading waste containers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load waste containers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContainers();
  }, [options?.status, options?.wasteType]);

  return {
    containers,
    loading,
    error,
    refresh: loadContainers,
  };
}
