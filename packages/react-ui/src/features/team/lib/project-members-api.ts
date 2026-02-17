import { api } from '@/lib/api';
import { SeekPage } from '@activepieces/shared';

type ProjectMemberWithUser = {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  projectRole: {
    name: string;
  };
};

type ListProjectMembersRequestQuery = {
  projectId: string;
  projectRoleId: string | undefined;
  cursor: string | undefined;
  limit: number;
};

type UpdateProjectMemberRoleRequestBody = {
  role: string;
};

export const projectMembersApi = {
  list(request: ListProjectMembersRequestQuery) {
    return api.get<SeekPage<ProjectMemberWithUser>>(
      '/v1/project-members',
      request,
    );
  },
  update(memberId: string, request: UpdateProjectMemberRoleRequestBody) {
    return api.post<void>(`/v1/project-members/${memberId}`, request);
  },
  delete(id: string): Promise<void> {
    return api.delete<void>(`/v1/project-members/${id}`);
  },
};
