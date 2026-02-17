import { api } from '@/lib/api';
import { AuthenticationResponse } from '@activepieces/shared';

type ManagedAuthnRequestBody = Record<string, unknown>;

export const managedAuthApi = {
  generateApToken: async (request: ManagedAuthnRequestBody) => {
    return api.post<AuthenticationResponse>(
      `/v1/managed-authn/external-token`,
      request,
    );
  },
};
