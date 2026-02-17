import { api } from '@/lib/api';
import { SeekPage } from '@activepieces/shared';

type ApiKeyResponseWithoutValue = {
  id: string;
  displayName: string;
  created: string;
  lastUsedAt: string | null;
};

type ApiKeyResponseWithValue = {
  id: string;
  displayName: string;
  value: string;
};

type CreateApiKeyRequest = {
  displayName: string;
};

export const apiKeyApi = {
  list() {
    return api.get<SeekPage<ApiKeyResponseWithoutValue>>('/v1/api-keys');
  },
  delete(keyId: string) {
    return api.delete<void>(`/v1/api-keys/${keyId}`);
  },
  create(request: CreateApiKeyRequest) {
    return api.post<ApiKeyResponseWithValue>(`/v1/api-keys/`, request);
  },
};
