import { useQuery } from '@tanstack/react-query';
import { fetchHealth } from '@/services/healthService';
import type { HealthStatus } from '@/types/api';
import type { UseQueryResult } from '@tanstack/react-query';

export function useHealth(): UseQueryResult<HealthStatus> {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 15000,
    retry: 1,
  });
}
