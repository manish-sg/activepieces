import { api } from '@/lib/api';
import { SeekPage } from '@activepieces/shared';

type Alert = {
  id: string;
  receiver: string;
  projectId: string;
  channel: string;
};

type CreateAlertParams = {
  receiver: string;
  projectId: string;
  channel: string;
};

type ListAlertsParams = {
  projectId: string;
  limit: number;
};

export const alertsApi = {
  create(request: CreateAlertParams): Promise<Alert> {
    return api.post<Alert>('/v1/alerts', request);
  },
  list(request: ListAlertsParams): Promise<SeekPage<Alert>> {
    return api.get<SeekPage<Alert>>('/v1/alerts', request);
  },
  delete(alertId: string): Promise<void> {
    return api.delete<void>(`/v1/alerts/${alertId}`);
  },
};
