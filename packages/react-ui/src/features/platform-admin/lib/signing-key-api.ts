import { api } from '@/lib/api';
import { SeekPage } from '@activepieces/shared';

type SigningKey = {
  id: string;
  displayName: string;
  created: string;
};

type SigningKeyId = string;

type AddSigningKeyRequestBody = {
  displayName: string;
};

type AddSigningKeyResponse = {
  id: string;
  displayName: string;
  privateKey: string;
};

export const signingKeyApi = {
  list() {
    return api.get<SeekPage<SigningKey>>('/v1/signing-keys');
  },
  delete(keyId: SigningKeyId) {
    return api.delete<void>(`/v1/signing-keys/${keyId}`);
  },
  create(request: AddSigningKeyRequestBody) {
    return api.post<AddSigningKeyResponse>(`/v1/signing-keys/`, request);
  },
};
