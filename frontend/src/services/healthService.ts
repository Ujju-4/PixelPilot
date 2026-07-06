import { apiGet } from '@/services/apiClient';
import type { HealthStatus } from '@/types/api';

export const fetchHealth = (): Promise<HealthStatus> => apiGet<HealthStatus>('/health');
