import { api } from '@/lib/api';
import { SeekPage } from '@activepieces/shared';

type ApplicationEvent = {
  id: string;
  action: string;
  userId: string;
  userEmail: string;
  projectId: string;
  data: Record<string, any>;
  created: string;
};

type ListAuditEventsRequest = {
  cursor?: string;
  limit?: number;
  action?: string[];
  projectId?: string[];
  userId?: string;
  createdBefore?: string;
  createdAfter?: string;
};

export const auditEventsApi = {
  list(request: ListAuditEventsRequest) {
    return api.get<SeekPage<ApplicationEvent>>('/v1/audit-events', request);
  },
};
